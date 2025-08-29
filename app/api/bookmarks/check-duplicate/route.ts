import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  ai_summary?: string;
  ai_tags?: string[];
  ai_category?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Load bookmarks from file
    const bookmarksPath = path.join(process.cwd(), 'data', 'bookmarks.json');
    
    let bookmarks: Bookmark[] = [];
    try {
      const bookmarksData = await fs.readFile(bookmarksPath, 'utf-8');
      bookmarks = JSON.parse(bookmarksData);
    } catch (error) {
      // If file doesn't exist or is empty, return no duplicate
      return NextResponse.json({
        isDuplicate: false,
        existing: null
      });
    }

    // Check for exact URL match
    const exactMatch = bookmarks.find(bookmark => 
      normalizeUrl(bookmark.url) === normalizeUrl(targetUrl)
    );

    if (exactMatch) {
      return NextResponse.json({
        isDuplicate: true,
        existing: {
          id: exactMatch.id,
          title: exactMatch.title,
          url: exactMatch.url,
          category: exactMatch.category,
          tags: exactMatch.tags,
          created_at: exactMatch.created_at
        },
        matchType: 'exact'
      });
    }

    // Check for similar URLs (same domain, similar path)
    const similarMatch = findSimilarUrl(targetUrl, bookmarks);
    
    if (similarMatch) {
      return NextResponse.json({
        isDuplicate: true,
        existing: {
          id: similarMatch.bookmark.id,
          title: similarMatch.bookmark.title,
          url: similarMatch.bookmark.url,
          category: similarMatch.bookmark.category,
          tags: similarMatch.bookmark.tags,
          created_at: similarMatch.bookmark.created_at
        },
        matchType: 'similar',
        similarity: similarMatch.similarity,
        reason: similarMatch.reason
      });
    }

    return NextResponse.json({
      isDuplicate: false,
      existing: null
    });

  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'source', 'campaign',
      '_ga', '_gl', 'mc_cid', 'mc_eid'
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Normalize hostname (remove www)
    urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Remove trailing slash from pathname
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // Sort search parameters for consistent comparison
    const sortedParams = new URLSearchParams();
    Array.from(urlObj.searchParams.keys())
      .sort()
      .forEach(key => {
        sortedParams.set(key, urlObj.searchParams.get(key) || '');
      });
    urlObj.search = sortedParams.toString();
    
    return urlObj.toString().toLowerCase();
  } catch {
    // If URL parsing fails, return original URL lowercased
    return url.toLowerCase();
  }
}

interface SimilarUrlMatch {
  bookmark: Bookmark;
  similarity: number;
  reason: string;
}

function findSimilarUrl(targetUrl: string, bookmarks: Bookmark[]): SimilarUrlMatch | null {
  try {
    const targetUrlObj = new URL(targetUrl);
    const targetDomain = targetUrlObj.hostname.replace(/^www\./, '');
    const targetPath = targetUrlObj.pathname;
    
    let bestMatch: SimilarUrlMatch | null = null;
    let highestSimilarity = 0;
    
    for (const bookmark of bookmarks) {
      try {
        const bookmarkUrlObj = new URL(bookmark.url);
        const bookmarkDomain = bookmarkUrlObj.hostname.replace(/^www\./, '');
        const bookmarkPath = bookmarkUrlObj.pathname;
        
        // Skip if different domains
        if (targetDomain !== bookmarkDomain) continue;
        
        // Calculate path similarity
        const pathSimilarity = calculatePathSimilarity(targetPath, bookmarkPath);
        
        // Consider it a potential duplicate if paths are very similar
        if (pathSimilarity > 0.8) {
          const similarity = pathSimilarity;
          
          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = {
              bookmark,
              similarity,
              reason: pathSimilarity === 1 ? 'Same path' : 'Very similar path'
            };
          }
        }
        
        // Special case: check for common URL patterns
        const specialSimilarity = checkSpecialUrlPatterns(targetUrlObj, bookmarkUrlObj);
        if (specialSimilarity > 0.9 && specialSimilarity > highestSimilarity) {
          highestSimilarity = specialSimilarity;
          bestMatch = {
            bookmark,
            similarity: specialSimilarity,
            reason: 'Same content, different URL format'
          };
        }
        
      } catch {
        // Skip invalid URLs
        continue;
      }
    }
    
    // Only return if similarity is high enough to be considered a duplicate
    return (highestSimilarity > 0.85) ? bestMatch : null;
    
  } catch {
    return null;
  }
}

function calculatePathSimilarity(path1: string, path2: string): number {
  // Normalize paths
  const normalize = (path: string) => path.replace(/\/$/, '') || '/';
  const normalizedPath1 = normalize(path1);
  const normalizedPath2 = normalize(path2);
  
  if (normalizedPath1 === normalizedPath2) return 1;
  
  const segments1 = normalizedPath1.split('/').filter(Boolean);
  const segments2 = normalizedPath2.split('/').filter(Boolean);
  
  if (segments1.length === 0 && segments2.length === 0) return 1;
  if (segments1.length === 0 || segments2.length === 0) return 0;
  
  // Calculate segment-by-segment similarity
  const maxLength = Math.max(segments1.length, segments2.length);
  let matchingSegments = 0;
  
  for (let i = 0; i < maxLength; i++) {
    const seg1 = segments1[i];
    const seg2 = segments2[i];
    
    if (seg1 && seg2) {
      if (seg1 === seg2) {
        matchingSegments += 1;
      } else if (isNumericId(seg1) && isNumericId(seg2)) {
        // Consider numeric IDs as potentially the same content
        matchingSegments += 0.7;
      } else if (seg1.includes(seg2) || seg2.includes(seg1)) {
        matchingSegments += 0.5;
      }
    }
  }
  
  return matchingSegments / maxLength;
}

function checkSpecialUrlPatterns(url1: URL, url2: URL): number {
  // Check for common URL patterns that might represent the same content
  
  // YouTube videos: different URL formats for same video
  if (url1.hostname.includes('youtube.com') && url2.hostname.includes('youtube.com')) {
    const videoId1 = extractYouTubeVideoId(url1);
    const videoId2 = extractYouTubeVideoId(url2);
    if (videoId1 && videoId2 && videoId1 === videoId2) {
      return 1;
    }
  }
  
  // GitHub repositories: different URL formats
  if (url1.hostname.includes('github.com') && url2.hostname.includes('github.com')) {
    const repo1 = extractGitHubRepo(url1);
    const repo2 = extractGitHubRepo(url2);
    if (repo1 && repo2 && repo1 === repo2) {
      return 0.95;
    }
  }
  
  // Medium articles: different URL formats
  if ((url1.hostname.includes('medium.com') || url1.hostname.includes('medium.')) &&
      (url2.hostname.includes('medium.com') || url2.hostname.includes('medium.'))) {
    const articleId1 = extractMediumArticleId(url1);
    const articleId2 = extractMediumArticleId(url2);
    if (articleId1 && articleId2 && articleId1 === articleId2) {
      return 1;
    }
  }
  
  // Reddit posts: different URL formats
  if (url1.hostname.includes('reddit.com') && url2.hostname.includes('reddit.com')) {
    const postId1 = extractRedditPostId(url1);
    const postId2 = extractRedditPostId(url2);
    if (postId1 && postId2 && postId1 === postId2) {
      return 1;
    }
  }
  
  return 0;
}

function isNumericId(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function extractYouTubeVideoId(url: URL): string | null {
  const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.href.match(videoIdRegex);
  return match ? match[1] : null;
}

function extractGitHubRepo(url: URL): string | null {
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    return `${pathParts[0]}/${pathParts[1]}`;
  }
  return null;
}

function extractMediumArticleId(url: URL): string | null {
  // Medium article IDs are typically at the end of the URL
  const idRegex = /([a-f0-9]{12,})/;
  const match = url.pathname.match(idRegex);
  return match ? match[1] : null;
}

function extractRedditPostId(url: URL): string | null {
  const postIdRegex = /\/comments\/([a-z0-9]+)/;
  const match = url.pathname.match(postIdRegex);
  return match ? match[1] : null;
} 