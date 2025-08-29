import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as Sentry from '@sentry/nextjs';
import { promises as fs } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
type BulkLinkStatus = 'queued' | 'validating' | 'processing' | 'processed' | 'saved' | 'duplicate' | 'failed';

interface BulkLink {
  id: string;
  url: string;
  title?: string;
  notes?: string;
  linkType?: 'video' | 'doc' | 'pdf' | 'repo' | 'web';
  predictedTags: string[];
  predictedFolder: string;
  status: BulkLinkStatus;
  error?: string;
  selected: boolean;
}

interface BulkUploaderSettings {
  batchSize: 10 | 20 | 30 | 40;
  extraTag?: string;
  forceFolderId?: string | null;
  privacy: 'private' | 'public';
  autoCategorize: boolean;
  duplicateHandling: 'skip' | 'overwrite' | 'keepBoth' | 'autoMerge';
  backgroundMode: boolean;
  language?: string;
  customRules?: string[];
}

interface ProcessingResult {
  success: boolean;
  processedLinks: BulkLink[];
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

// File-based storage types and helper functions
interface BookmarkData {
  id: number;
  user_id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  ai_summary: string;
  ai_tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

const bookmarksFilePath = path.join(process.cwd(), 'data', 'bookmarks.json');

const loadBookmarks = async (): Promise<BookmarkData[]> => {
  try {
    const data = await fs.readFile(bookmarksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing bookmarks file found, creating new one');
    return [];
  }
};

const saveBookmarks = async (bookmarks: BookmarkData[]): Promise<void> => {
  try {
    await fs.mkdir(path.dirname(bookmarksFilePath), { recursive: true });
    await fs.writeFile(bookmarksFilePath, JSON.stringify(bookmarks, null, 2));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
    throw error;
  }
};

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const detectLinkType = (url: string): 'video' | 'doc' | 'pdf' | 'repo' | 'web' => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || urlLower.includes('twitch.tv') || urlLower.includes('youtu.be')) {
    return 'video';
  }
  if (urlLower.includes('github.com') || urlLower.includes('gitlab.com') || urlLower.includes('bitbucket.org')) {
    return 'repo';
  }
  if (urlLower.includes('.pdf') || urlLower.includes('pdf')) {
    return 'pdf';
  }
  if (urlLower.includes('docs.google.com') || urlLower.includes('notion.so') || urlLower.includes('.doc') || urlLower.includes('confluence')) {
    return 'doc';
  }
  return 'web';
};

const cleanUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source'];
    trackingParams.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch {
    return url;
  }
};

const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper function to safely parse AI JSON responses
const parseAIResponse = (content: string): any => {
  try {
    // First try direct JSON parsing
    return JSON.parse(content);
  } catch (error) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to find JSON object in the content
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (parseError) {
      console.warn('Failed to parse AI response:', content.substring(0, 200));
      return {};
    }
  }
};

const predictTagsAndFolder = async (url: string, settings: BulkUploaderSettings): Promise<{ tags: string[]; folder: string }> => {
  const hostname = new URL(url).hostname.toLowerCase();
  
  // Basic prediction based on URL patterns
  let tags: string[] = [];
  let folder = 'General';

  // Domain-based categorization
  if (hostname.includes('github.com')) {
    tags.push('development', 'code', 'repository');
    folder = 'Development';
  } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    tags.push('video', 'tutorial', 'media');
    folder = 'Videos';
  } else if (hostname.includes('medium.com') || hostname.includes('dev.to') || hostname.includes('hashnode.com')) {
    tags.push('article', 'blog', 'reading');
    folder = 'Articles';
  } else if (hostname.includes('stackoverflow.com') || hostname.includes('stackexchange.com')) {
    tags.push('qa', 'programming', 'help');
    folder = 'Development';
  } else if (hostname.includes('docs.google.com') || hostname.includes('notion.so')) {
    tags.push('document', 'notes', 'collaboration');
    folder = 'Documents';
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com') || hostname.includes('linkedin.com')) {
    tags.push('social', 'networking', 'discussion');
    folder = 'Social';
  } else if (hostname.includes('reddit.com')) {
    tags.push('discussion', 'community', 'forum');
    folder = 'Forums';
  }

  // AI-enhanced categorization if enabled
  if (settings.autoCategorize) {
    try {
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a URL categorization expert. Analyze the URL and provide relevant tags and folder suggestions.
            
            Rules:
            - Provide 2-5 relevant tags
            - Suggest an appropriate folder name
            - Consider the domain, path, and URL structure
            - Tags should be lowercase, single words or short phrases
            - Folder should be a clear category name
            - Respond ONLY with valid JSON: {"tags": ["tag1", "tag2"], "folder": "FolderName"}
            
            Language preference: ${settings.language || 'english'}`
          },
          {
            role: 'user',
            content: `Categorize this URL: ${url}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      const aiResult = parseAIResponse(aiResponse.choices[0].message.content || '{}');
      if (aiResult.tags && Array.isArray(aiResult.tags)) {
        tags = [...new Set([...tags, ...aiResult.tags])];
      }
      if (aiResult.folder && typeof aiResult.folder === 'string') {
        folder = aiResult.folder;
      }
    } catch (error) {
      console.warn('AI categorization failed:', error);
      // Continue with basic categorization
    }
  }

  // Add extra tag if specified
  if (settings.extraTag) {
    tags.push(settings.extraTag);
  }

  // Use forced folder if specified
  if (settings.forceFolderId) {
    folder = settings.forceFolderId;
  }

  return { tags: [...new Set(tags)], folder };
};

const fetchMetadata = async (url: string): Promise<{ title?: string; description?: string }> => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract description
    const descMatch = html.match(/<meta[^>]*name=['"](description|og:description)['"'][^>]*content=['"']([^'"]*)['"']/i);
    const description = descMatch ? descMatch[2].trim() : undefined;

    return { title, description };
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${url}:`, error);
    return {};
  }
};

const checkDuplicates = async (userId: string, urls: string[]): Promise<Set<string>> => {
  try {
    const allBookmarks = await loadBookmarks();
    const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
    
    const existingUrls = userBookmarks.map(bookmark => bookmark.url);
    const duplicateUrls = urls.filter(url => existingUrls.includes(url));
    
    return new Set(duplicateUrls);
  } catch (error) {
    console.warn('Failed to check duplicates:', error);
    return new Set();
  }
};

const saveLinksToDatabase = async (userId: string, links: BulkLink[]) => {
  const linksToSave = links.filter(link => link.selected && (link.status === 'processed' || link.status === 'saved'));
  
  if (linksToSave.length === 0) {
    return;
  }
  
  try {
    // Load existing bookmarks
    const allBookmarks = await loadBookmarks();
    
    // Get the highest existing ID
    const maxId = allBookmarks.length > 0 ? Math.max(...allBookmarks.map(b => b.id)) : 0;
    let nextId = maxId + 1;
    
    // Create new bookmarks
    const newBookmarks = linksToSave.map((link) => {
      const bookmarkData = {
        id: nextId++,
        user_id: userId,
        title: link.title || new URL(link.url).hostname,
        url: link.url,
        description: link.notes || `${link.linkType} resource - ${link.predictedTags.join(', ')}`,
        category: link.predictedFolder,
        tags: link.predictedTags,
        ai_summary: `Auto-categorized ${link.linkType} resource`,
        ai_tags: link.predictedTags,
        notes: link.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      link.status = 'saved';
      link.id = bookmarkData.id.toString();
      
      console.log(`✅ Successfully prepared bookmark: ${link.title} (${link.url}) with ID: ${bookmarkData.id}`);
      
      return bookmarkData;
    });
    
    // Add new bookmarks to existing ones
    const updatedBookmarks = [...allBookmarks, ...newBookmarks];
    
    // Save to file
    await saveBookmarks(updatedBookmarks);
    
    console.log(`✅ Successfully saved ${newBookmarks.length} bookmarks to file storage`);
    
  } catch (error) {
    console.error('Failed to save bookmarks:', error);
    // Mark all links as failed
    linksToSave.forEach(link => {
      link.status = 'failed';
      link.error = error instanceof Error ? error.message : 'File storage error';
    });
  }
};

// GET endpoint - Return current settings and status
export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('🔗 Bulk Uploader API called (GET)');
    console.log('🚀 PRODUCTION MODE: Authentication bypassed for bulk operations');
    
    return NextResponse.json({
      success: true,
      message: 'Bulk Uploader API is ready (production mode, auth bypassed)',
      userId: 'bulk-uploader-service',
      supportedFeatures: [
        'URL validation',
        'AI-powered categorization',
        'Duplicate detection',
        'Batch processing',
        'Metadata extraction',
        'CSV/Text parsing',
        'Custom tagging',
        'Folder organization'
      ],
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Bulk Uploader API Error:', error);
    Sentry.captureException(error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint - Process bulk links
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return Sentry.startSpan(
    {
      op: "ai.bulk_uploader",
      name: "Bulk Link Processing",
    },
    async (span) => {
      try {
        console.log('🔗 Bulk Uploader API called (POST)');

        // Use file-based storage with user ID from query parameters or default
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id') || 'dev-user-123';
        
        console.log('🚀 FILE STORAGE MODE: Using file-based storage for user:', userId);
        
        const body = await request.json();
        const { links, settings } = body;

        // Validate input
        if (!links || !Array.isArray(links) || links.length === 0) {
          return NextResponse.json({ error: 'Links array is required' }, { status: 400 });
        }

        if (links.length > 100) {
          return NextResponse.json({ error: 'Maximum 100 links per batch' }, { status: 400 });
        }

        // Default settings
        const processingSettings: BulkUploaderSettings = {
          batchSize: 20,
          privacy: 'private',
          autoCategorize: true,
          duplicateHandling: 'autoMerge',
          backgroundMode: false,
          language: 'english',
          ...settings
        };

        span.setAttribute("links.count", links.length);
        span.setAttribute("settings.autoCategorize", processingSettings.autoCategorize);
        span.setAttribute("settings.batchSize", processingSettings.batchSize);
        span.setAttribute("user.id", userId);

        console.log(`📋 Processing ${links.length} links for user ${userId}`);

        const processedLinks: BulkLink[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];
        let totalSuccessful = 0;
        let totalFailed = 0;

        // Step 1: Validate and clean URLs
        console.log('🔍 Step 1: Validating URLs...');
        const validLinks = links.filter((linkData: string | { url: string }) => {
          const url = typeof linkData === 'string' ? linkData : linkData.url;
          if (!validateUrl(url)) {
            errors.push(`Invalid URL: ${url}`);
            return false;
          }
          return true;
        });

        if (validLinks.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No valid URLs found',
            errors
          }, { status: 400 });
        }

        // Step 2: Check for duplicates
        console.log('🔍 Step 2: Checking for duplicates...');
        const urls = validLinks.map((linkData: string | { url: string }) => 
          cleanUrl(typeof linkData === 'string' ? linkData : linkData.url)
        );
        
        const duplicates = await checkDuplicates(userId, urls);
        
        if (duplicates.size > 0) {
          warnings.push(`Found ${duplicates.size} duplicate URLs`);
        }

        // Step 3: Process links in batches
        console.log(`🔄 Step 3: Processing ${validLinks.length} links in batches of ${processingSettings.batchSize}...`);
        
        for (let i = 0; i < validLinks.length; i += processingSettings.batchSize) {
          const batch = validLinks.slice(i, i + processingSettings.batchSize);
          
          const batchPromises = batch.map(async (linkData: string | { url: string; title?: string; notes?: string }) => {
            const url = typeof linkData === 'string' ? linkData : linkData.url;
            const cleanedUrl = cleanUrl(url);
            
            const bulkLink: BulkLink = {
              id: generateId(),
              url: cleanedUrl,
              title: typeof linkData === 'object' ? linkData.title : undefined,
              notes: typeof linkData === 'object' ? linkData.notes : undefined,
              linkType: detectLinkType(cleanedUrl),
              predictedTags: [],
              predictedFolder: 'General',
              status: 'processing',
              selected: true
            };

            try {
              // Handle duplicates
              if (duplicates.has(cleanedUrl)) {
                if (processingSettings.duplicateHandling === 'skip') {
                  bulkLink.status = 'duplicate';
                  bulkLink.error = 'URL already exists';
                  return bulkLink;
                }
                // For other duplicate handling strategies, continue processing
              }

              // Fetch metadata
              const metadata = await fetchMetadata(cleanedUrl);
              if (metadata.title) {
                bulkLink.title = metadata.title;
              }
              if (metadata.description && !bulkLink.notes) {
                bulkLink.notes = metadata.description;
              }

              // Predict tags and folder
              const { tags, folder } = await predictTagsAndFolder(cleanedUrl, processingSettings);
              bulkLink.predictedTags = tags;
              bulkLink.predictedFolder = folder;

              bulkLink.status = 'processed'; // Will be set to 'saved' after database insertion
              return bulkLink;

            } catch (error) {
              console.error(`Failed to process ${cleanedUrl}:`, error);
              bulkLink.status = 'failed';
              bulkLink.error = error instanceof Error ? error.message : 'Processing error';
              return bulkLink;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          processedLinks.push(...batchResults);

          console.log(`✅ Processed batch ${Math.floor(i / processingSettings.batchSize) + 1}/${Math.ceil(validLinks.length / processingSettings.batchSize)}`);
        }

        // Step 4: Save to file storage
        console.log('💾 Step 4: Saving to file storage...');
        await saveLinksToDatabase(userId, processedLinks);

        // Update counters after database operations
        totalSuccessful = processedLinks.filter(link => link.status === 'saved').length;
        totalFailed = processedLinks.filter(link => link.status === 'failed').length;

        const processingTime = Date.now() - startTime;
        
        const result: ProcessingResult = {
          success: true,
          processedLinks,
          totalProcessed: processedLinks.length,
          totalSuccessful,
          totalFailed,
          errors,
          warnings,
          processingTime
        };

        console.log(`✅ Bulk upload completed: ${totalSuccessful} successful, ${totalFailed} failed in ${processingTime}ms`);
        
        span.setAttribute("result.totalProcessed", result.totalProcessed);
        span.setAttribute("result.totalSuccessful", result.totalSuccessful);
        span.setAttribute("result.totalFailed", result.totalFailed);
        span.setAttribute("result.processingTime", result.processingTime);

        return NextResponse.json(result);

      } catch (error) {
        console.error('Bulk Uploader API Error:', error);
        Sentry.captureException(error);
        
        span.setAttribute("error", true);
        span.setAttribute("error.message", error instanceof Error ? error.message : 'Unknown error');
        
        return NextResponse.json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime
        }, { status: 500 });
      }
    }
  );
} 