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

interface SimilarityScore {
  bookmark: Bookmark;
  score: number;
  reasons: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Load bookmarks from file
    const bookmarksPath = path.join(process.cwd(), 'data', 'bookmarks.json');
    const bookmarksData = await fs.readFile(bookmarksPath, 'utf-8');
    const bookmarks: Bookmark[] = JSON.parse(bookmarksData);

    // Find similar bookmarks
    const similarBookmarks = await findSimilarBookmarks(targetUrl, bookmarks, limit);

    return NextResponse.json({
      similar: similarBookmarks.map(item => ({
        id: item.bookmark.id,
        title: item.bookmark.title,
        url: item.bookmark.url,
        category: item.bookmark.category,
        tags: item.bookmark.tags,
        score: item.score,
        reasons: item.reasons
      })),
      count: similarBookmarks.length
    });

  } catch (error) {
    console.error('Error finding similar bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to find similar bookmarks' },
      { status: 500 }
    );
  }
}

async function findSimilarBookmarks(
  targetUrl: string, 
  bookmarks: Bookmark[], 
  limit: number
): Promise<SimilarityScore[]> {
  const targetDomain = extractDomain(targetUrl);
  const targetKeywords = extractKeywords(targetUrl);
  
  const similarities: SimilarityScore[] = [];

  for (const bookmark of bookmarks) {
    if (bookmark.url === targetUrl) continue; // Skip exact match
    
    const score = calculateSimilarityScore(
      targetUrl,
      targetDomain,
      targetKeywords,
      bookmark
    );

    if (score.score > 0.3) { // Minimum similarity threshold
      similarities.push(score);
    }
  }

  // Sort by score and return top results
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateSimilarityScore(
  targetUrl: string,
  targetDomain: string,
  targetKeywords: string[],
  bookmark: Bookmark
): SimilarityScore {
  let score = 0;
  const reasons: string[] = [];

  const bookmarkDomain = extractDomain(bookmark.url);
  const bookmarkKeywords = extractKeywords(bookmark.url, bookmark.title, bookmark.description);

  // Domain similarity (highest weight)
  if (targetDomain === bookmarkDomain) {
    score += 0.4;
    reasons.push('Same domain');
  } else if (targetDomain.includes(bookmarkDomain) || bookmarkDomain.includes(targetDomain)) {
    score += 0.2;
    reasons.push('Similar domain');
  }

  // URL path similarity
  const targetPath = new URL(targetUrl).pathname;
  const bookmarkPath = new URL(bookmark.url).pathname;
  const pathSimilarity = calculatePathSimilarity(targetPath, bookmarkPath);
  if (pathSimilarity > 0.5) {
    score += pathSimilarity * 0.3;
    reasons.push('Similar URL structure');
  }

  // Keyword similarity
  const keywordSimilarity = calculateKeywordSimilarity(targetKeywords, bookmarkKeywords);
  if (keywordSimilarity > 0.3) {
    score += keywordSimilarity * 0.2;
    reasons.push('Similar keywords');
  }

  // Category similarity (if AI categorized)
  if (bookmark.ai_category) {
    const targetCategory = categorizeUrl(targetUrl);
    if (targetCategory === bookmark.ai_category) {
      score += 0.1;
      reasons.push('Same category');
    }
  }

  // Tag similarity
  if (bookmark.ai_tags && bookmark.ai_tags.length > 0) {
    const targetTags = generateTags(targetUrl);
    const tagSimilarity = calculateTagSimilarity(targetTags, bookmark.ai_tags);
    if (tagSimilarity > 0.2) {
      score += tagSimilarity * 0.1;
      reasons.push('Similar tags');
    }
  }

  return {
    bookmark,
    score: Math.min(score, 1), // Cap at 1.0
    reasons
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace('www.', '');
  } catch {
    return '';
  }
}

function extractKeywords(url: string, title?: string, description?: string): string[] {
  const text = [url, title, description].filter(Boolean).join(' ').toLowerCase();
  
  // Extract meaningful words
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !isStopWord(word));

  // Count frequency and return top words
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function calculatePathSimilarity(path1: string, path2: string): number {
  const segments1 = path1.split('/').filter(Boolean);
  const segments2 = path2.split('/').filter(Boolean);
  
  if (segments1.length === 0 && segments2.length === 0) return 1;
  if (segments1.length === 0 || segments2.length === 0) return 0;
  
  const commonSegments = segments1.filter(seg => segments2.includes(seg)).length;
  const totalSegments = Math.max(segments1.length, segments2.length);
  
  return commonSegments / totalSegments;
}

function calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  return calculateKeywordSimilarity(tags1, tags2);
}

function categorizeUrl(url: string): string {
  const domain = extractDomain(url);
  const urlLower = url.toLowerCase();
  
  if (domain.includes('github.com') || urlLower.includes('code') || urlLower.includes('programming')) {
    return 'development';
  } else if (domain.includes('youtube.com') || domain.includes('netflix.com')) {
    return 'entertainment';
  } else if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) {
    return 'news';
  } else if (urlLower.includes('tutorial') || urlLower.includes('learn')) {
    return 'learning';
  } else if (domain.includes('amazon') || urlLower.includes('shop')) {
    return 'shopping';
  }
  
  return 'general';
}

function generateTags(url: string): string[] {
  const domain = extractDomain(url);
  const tags: string[] = [];
  
  // Domain-based tags
  if (domain.includes('github.com')) tags.push('code', 'programming', 'development');
  if (domain.includes('youtube.com')) tags.push('video', 'entertainment');
  if (domain.includes('stackoverflow.com')) tags.push('programming', 'help', 'development');
  if (domain.includes('medium.com')) tags.push('article', 'blog', 'reading');
  if (domain.includes('wikipedia.org')) tags.push('reference', 'encyclopedia', 'knowledge');
  
  // URL-based tags
  const urlLower = url.toLowerCase();
  if (urlLower.includes('tutorial')) tags.push('tutorial', 'learning');
  if (urlLower.includes('api')) tags.push('api', 'documentation');
  if (urlLower.includes('docs')) tags.push('documentation', 'reference');
  if (urlLower.includes('blog')) tags.push('blog', 'article');
  
  return [...new Set(tags)]; // Remove duplicates
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me',
    'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'www',
    'com', 'org', 'net', 'edu', 'gov', 'http', 'https', 'html', 'php', 'asp', 'jsp'
  ]);
  
  return stopWords.has(word.toLowerCase());
} 