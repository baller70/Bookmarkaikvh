import OpenAI from 'openai';
// // import { performanceUtils } from '../monitoring/performance-enhanced';
import { logger } from '../logger';
import { validateUrl } from '../security/url-validator';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentAnalysisResult {
  summary: string;
  tags: string[];
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  readingTime: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  topics: string[];
  qualityScore: number;
  keyPoints: string[];
  relatedKeywords: string[];
  contentType: 'article' | 'tutorial' | 'news' | 'documentation' | 'blog' | 'research' | 'other';
}

export interface ContentMetadata {
  title: string;
  url: string;
  content: string;
  author?: string;
  publishDate?: string;
  wordCount?: number;
}

export interface AnalysisOptions {
  includeSummary?: boolean;
  includeTags?: boolean;
  includeCategory?: boolean;
  includeSentiment?: boolean;
  includeComplexity?: boolean;
  includeTopics?: boolean;
  includeKeyPoints?: boolean;
  maxSummaryLength?: number;
  maxTags?: number;
  language?: string;
}

class ContentAnalysisService {
  private readonly DEFAULT_OPTIONS: AnalysisOptions = {
    includeSummary: true,
    includeTags: true,
    includeCategory: true,
    includeSentiment: true,
    includeComplexity: true,
    includeTopics: true,
    includeKeyPoints: true,
    maxSummaryLength: 200,
    maxTags: 10,
    language: 'en'
  };

  /**
   * Analyze content using GPT-4
   */
  async analyzeContent(
    metadata: ContentMetadata,
    options: AnalysisOptions = {}
  ): Promise<ContentAnalysisResult> {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
<<<<<<< HEAD
    try {
      // Prepare content for analysis
      const contentToAnalyze = this.prepareContentForAnalysis(metadata);

      // Create analysis prompt
      const prompt = this.createAnalysisPrompt(contentToAnalyze, finalOptions);

      // Call GPT-4 for analysis
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content analyst. Analyze the provided content and return a structured JSON response with the requested analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');

      // Process and validate the result
      const result = this.processAnalysisResult(analysisResult, metadata, finalOptions);

      logger.info('Content analysis completed', {
        metadata: {
          url: metadata.url,
          contentLength: metadata.content.length,
          summary: result.summary.substring(0, 100) + '...',
          tags: result.tags,
          category: result.category,
        },
      });

      return result;
    } catch (error) {
      logger.error(
        'Content analysis failed',
        error instanceof Error ? error : undefined,
        { metadata: { url: metadata.url } }
      );

=======
    
    try {
      // Prepare content for analysis
      const contentToAnalyze = this.prepareContentForAnalysis(metadata);
      
      // Create analysis prompt
      const prompt = this.createAnalysisPrompt(contentToAnalyze, finalOptions);
      
      // Call GPT-4 for analysis
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Analyze the provided content and return a structured JSON response with the requested analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Process and validate the result
      const result = this.processAnalysisResult(analysisResult, metadata, finalOptions);
      
      logger.info('Content analysis completed');
      
      return result;
      
    } catch (error) {
      logger.error('Content analysis failed', error instanceof Error ? error : new Error('Unknown error'));
      
>>>>>>> devin/1752953929-backend-infrastructure-fixes
      // Return fallback analysis
      return this.getFallbackAnalysis(metadata);
    }
  }

  /**
   * Analyze multiple content items in batch
   */
  async analyzeContentBatch(
    contentList: ContentMetadata[],
    options: AnalysisOptions = {}
  ): Promise<ContentAnalysisResult[]> {
    const batchSize = 5; // Process in batches to avoid rate limits
    const results: ContentAnalysisResult[] = [];
    
    for (let i = 0; i < contentList.length; i += batchSize) {
      const batch = contentList.slice(i, i + batchSize);
      const batchPromises = batch.map(content => 
        this.analyzeContent(content, options).catch(error => {
          logger.error('Batch analysis failed for item', error instanceof Error ? error : new Error('Unknown error'));
          return this.getFallbackAnalysis(content);
        })
      );
      
<<<<<<< HEAD
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error(
            'Batch analysis failed for item',
            result.reason instanceof Error ? result.reason : undefined,
            { metadata: { index: i + index, url: batch[index].url } }
          );
          results.push(this.getFallbackAnalysis(batch[index]));
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < contentList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
=======
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
>>>>>>> devin/1752953929-backend-infrastructure-fixes
    }
    
    return results;
  }

  /**
   * Extract content from URL
   */
  async extractContentFromUrl(url: string): Promise<ContentMetadata> {
    try {
<<<<<<< HEAD
      // Simple content extraction using fetch
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BookAIMark Content Analyzer 1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
=======
      // Validate URL to prevent SSRF
      const validation = validateUrl(url);
      if (!validation.isValid) {
        throw new Error(`URL validation failed: ${validation.error}`);
      }

      // Simple content extraction using fetch
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BookAIMark Content Analyzer 1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
>>>>>>> devin/1752953929-backend-infrastructure-fixes
      
      const html = await response.text();
      const extracted = this.extractContentFromHtml(html);
      
      return {
        title: extracted.title || 'Untitled',
        url,
        content: extracted.content,
        author: extracted.author,
        publishDate: extracted.publishDate,
        wordCount: extracted.content.split(/\s+/).length
      };
      
    } catch (error) {
<<<<<<< HEAD
      logger.error(
        'Content extraction failed',
        error instanceof Error ? error : undefined,
        { metadata: { url } }
      );
=======
      logger.error('Content extraction failed', error instanceof Error ? error : new Error('Unknown error'));
>>>>>>> devin/1752953929-backend-infrastructure-fixes
      
      return {
        title: 'Content Extraction Failed',
        url,
        content: 'Unable to extract content from this URL.',
        wordCount: 0
      };
    }
  }

  /**
   * Generate similar content suggestions
   */
  async generateSimilarContentSuggestions(
    analysis: ContentAnalysisResult,
    count: number = 5
  ): Promise<string[]> {
    try {
      const prompt = `Based on this content analysis:
<<<<<<< HEAD
 - Summary: ${analysis.summary}
 - Tags: ${analysis.tags.join(', ')}
 - Category: ${analysis.category}
 - Topics: ${analysis.topics.join(', ')}
 
 Generate ${count} specific search queries or topics that would help find similar, related, or complementary content. Return as a JSON array of strings.`;
=======
- Summary: ${analysis.summary}
- Tags: ${analysis.tags.join(', ')}
- Category: ${analysis.category}
- Topics: ${analysis.topics.join(', ')}
>>>>>>> devin/1752953929-backend-infrastructure-fixes

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content discovery expert. Generate relevant search queries for finding similar content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

<<<<<<< HEAD
=======
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content discovery expert. Generate relevant search queries for finding similar content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

>>>>>>> devin/1752953929-backend-infrastructure-fixes
      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
      
    } catch (error) {
<<<<<<< HEAD
      logger.error(
        'Similar content suggestions failed',
        error instanceof Error ? error : undefined
      );
=======
      logger.error('Similar content suggestions failed', error instanceof Error ? error : new Error('Unknown error'));
>>>>>>> devin/1752953929-backend-infrastructure-fixes
      
      return [];
    }
  }

  /**
   * Prepare content for analysis by cleaning and truncating
   */
  private prepareContentForAnalysis(metadata: ContentMetadata): string {
    let content = metadata.content || '';
    
    content = content.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (GPT-4 token limits)
    const maxLength = 8000; // Conservative limit
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return content;
  }

  /**
   * Create analysis prompt based on options
   */
  private createAnalysisPrompt(content: string, options: AnalysisOptions): string {
    const sections: string[] = [];
    
    if (options.includeSummary) {
      sections.push(`- summary: A concise summary (max ${options.maxSummaryLength || 200} characters)`);
    }
    
    if (options.includeTags) {
      sections.push(`- tags: Array of relevant tags (max ${options.maxTags || 10})`);
    }
    
    if (options.includeCategory) {
      sections.push('- category: Primary category (article, tutorial, news, documentation, blog, research, other)');
    }
    
    if (options.includeSentiment) {
      sections.push('- sentiment: Overall sentiment (positive, negative, neutral)');
    }
    
    if (options.includeComplexity) {
      sections.push('- complexity: Content complexity (beginner, intermediate, advanced)');
    }
    
    if (options.includeTopics) {
      sections.push('- topics: Array of main topics discussed');
    }
    
    if (options.includeKeyPoints) {
      sections.push('- keyPoints: Array of key points or takeaways');
    }
    
    sections.push('- readingTime: Estimated reading time in minutes');
    sections.push('- qualityScore: Content quality score (1-10)');
    sections.push('- relatedKeywords: Array of related keywords');
    sections.push(`- language: Content language (default: ${options.language || 'en'})`);
    sections.push('- contentType: Type of content (article, tutorial, news, documentation, blog, research, other)');
    
    return `Analyze the following content and return a JSON object with these fields:
${sections.join('\n')}

Content to analyze:
${content}`;
  }

  /**
   * Process and validate analysis result
   */
  private processAnalysisResult(
    result: any,
    metadata: ContentMetadata,
    options: AnalysisOptions
  ): ContentAnalysisResult {
    return {
      summary: result.summary || metadata.title || 'No summary available',
      tags: Array.isArray(result.tags) ? result.tags.slice(0, options.maxTags || 10) : [],
      category: result.category || 'other',
      sentiment: result.sentiment || 'neutral',
      readingTime: result.readingTime || Math.ceil((metadata.wordCount || 0) / 200),
      complexity: result.complexity || 'intermediate',
      language: result.language || options.language || 'en',
      topics: Array.isArray(result.topics) ? result.topics : [],
      qualityScore: result.qualityScore || 5,
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      relatedKeywords: Array.isArray(result.relatedKeywords) ? result.relatedKeywords : [],
      contentType: result.contentType || 'other'
    };
  }

  /**
   * Get fallback analysis when AI analysis fails
   */
  private getFallbackAnalysis(metadata: ContentMetadata): ContentAnalysisResult {
    return {
      summary: metadata.title || 'Content analysis unavailable',
      tags: this.extractBasicTags(metadata.content || metadata.title || ''),
      category: 'other',
      sentiment: 'neutral',
      readingTime: Math.ceil((metadata.wordCount || 0) / 200) || 1,
      complexity: 'intermediate',
      language: 'en',
      topics: [],
      qualityScore: 5,
      keyPoints: [],
      relatedKeywords: [],
      contentType: 'other'
    };
  }

  /**
   * Extract basic tags from content
   */
  private extractBasicTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
  }

  /**
   * Extract content from HTML
   */
  private extractContentFromHtml(html: string): { title: string; content: string; author?: string; publishDate?: string } {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    
    // Extract author (basic meta tag extraction)
    const authorMatch = html.match(/<meta[^>]*name=["\']author["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
    const author = authorMatch ? authorMatch[1] : undefined;
    
    // Extract publish date
    const dateMatch = html.match(/<meta[^>]*property=["\']article:published_time["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
    const publishDate = dateMatch ? dateMatch[1] : undefined;
    
    return {
      title,
      content,
      author,
      publishDate
    };
  }
}

// Export singleton instance
export const contentAnalysisService = new ContentAnalysisService();

// Export utility functions
export const contentAnalysisUtils = {
  /**
   * Quick content analysis for bookmarks
   */
  analyzeBookmark: async (url: string, title: string, description?: string): Promise<ContentAnalysisResult> => {
    try {
      // Try to extract content from URL
      const metadata = await contentAnalysisService.extractContentFromUrl(url);
      
      // If extraction failed, use provided data
      if (metadata.content === 'Unable to extract content from this URL.') {
        metadata.title = title;
        metadata.content = description || title;
      }
      
      return await contentAnalysisService.analyzeContent(metadata);
      
    } catch (error) {
<<<<<<< HEAD
      logger.error(
        'Bookmark analysis failed',
        error instanceof Error ? error : undefined,
        { metadata: { url } }
      );
=======
      logger.error('Bookmark analysis failed', error instanceof Error ? error : new Error('Unknown error'));
>>>>>>> devin/1752953929-backend-infrastructure-fixes
      
      // Return basic analysis
      return {
        summary: description || title,
        tags: title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
        category: 'other',
        sentiment: 'neutral',
        readingTime: 1,
        complexity: 'intermediate',
        language: 'en',
        topics: [],
        qualityScore: 5,
        keyPoints: [],
        relatedKeywords: [],
        contentType: 'other'
      };
    }
  },

  /**
   * Analyze existing bookmark content
   */
  analyzeExistingContent: async (title: string, content: string, url: string): Promise<ContentAnalysisResult> => {
    const metadata: ContentMetadata = {
      title,
      url,
      content,
      wordCount: content.split(/\s+/).length
    };
    
    return await contentAnalysisService.analyzeContent(metadata);
  },

  /**
   * Get content suggestions based on analysis
   */
  getSimilarContentSuggestions: async (analysis: ContentAnalysisResult, count: number = 5): Promise<string[]> => {
    return await contentAnalysisService.generateSimilarContentSuggestions(analysis, count);
  }
};        