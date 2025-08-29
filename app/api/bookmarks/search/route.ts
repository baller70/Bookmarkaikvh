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

interface SearchResult {
  bookmark: Bookmark;
  score: number;
  matchedFields: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
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
      return NextResponse.json({
        bookmarks: [],
        total: 0,
        query,
        limit,
        offset
      });
    }

    // Perform search
    const searchResults = performSearch(query, bookmarks, category);
    
    // Apply pagination
    const paginatedResults = searchResults.slice(offset, offset + limit);

    return NextResponse.json({
      bookmarks: paginatedResults.map(result => ({
        ...result.bookmark,
        searchScore: result.score,
        matchedFields: result.matchedFields
      })),
      total: searchResults.length,
      query,
      category,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error searching bookmarks:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

function performSearch(query: string, bookmarks: Bookmark[], category?: string | null): SearchResult[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
  const results: SearchResult[] = [];

  for (const bookmark of bookmarks) {
    // Apply category filter if specified
    if (category && bookmark.category !== category && bookmark.ai_category !== category) {
      continue;
    }

    const searchResult = calculateSearchScore(searchTerms, bookmark);
    
    if (searchResult.score > 0) {
      results.push(searchResult);
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

function calculateSearchScore(searchTerms: string[], bookmark: Bookmark): SearchResult {
  let totalScore = 0;
  const matchedFields: string[] = [];
  
  // Searchable fields with their weights
  const searchFields = [
    { field: 'title', content: bookmark.title, weight: 3.0 },
    { field: 'description', content: bookmark.description || '', weight: 2.0 },
    { field: 'url', content: bookmark.url, weight: 1.5 },
    { field: 'tags', content: bookmark.tags.join(' '), weight: 2.5 },
    { field: 'ai_tags', content: (bookmark.ai_tags || []).join(' '), weight: 2.0 },
    { field: 'category', content: bookmark.category, weight: 1.5 },
    { field: 'ai_category', content: bookmark.ai_category || '', weight: 1.5 },
    { field: 'ai_summary', content: bookmark.ai_summary || '', weight: 1.0 }
  ];

  for (const { field, content, weight } of searchFields) {
    if (!content) continue;
    
    const fieldContent = content.toLowerCase();
    let fieldScore = 0;
    let hasMatch = false;

    for (const term of searchTerms) {
      const termScore = calculateTermScore(term, fieldContent, field);
      if (termScore > 0) {
        fieldScore += termScore;
        hasMatch = true;
      }
    }

    if (hasMatch) {
      totalScore += fieldScore * weight;
      matchedFields.push(field);
    }
  }

  // Boost score for exact phrase matches
  const fullQuery = searchTerms.join(' ');
  for (const { field, content, weight } of searchFields) {
    if (content && content.toLowerCase().includes(fullQuery)) {
      totalScore += weight * 0.5; // Phrase match bonus
      if (!matchedFields.includes(field)) {
        matchedFields.push(field);
      }
    }
  }

  return {
    bookmark,
    score: totalScore,
    matchedFields
  };
}

function calculateTermScore(term: string, content: string, field: string): number {
  if (!content.includes(term)) return 0;

  let score = 0;
  
  // Exact word match (highest score)
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi');
  const exactMatches = (content.match(wordBoundaryRegex) || []).length;
  score += exactMatches * 1.0;

  // Partial match (lower score)
  if (exactMatches === 0) {
    const partialMatches = (content.match(new RegExp(escapeRegex(term), 'gi')) || []).length;
    score += partialMatches * 0.3;
  }

  // Position bonus (matches at the beginning are more relevant)
  const firstIndex = content.indexOf(term);
  if (firstIndex === 0) {
    score += 0.5; // Start of content
  } else if (firstIndex > 0 && firstIndex < content.length * 0.1) {
    score += 0.3; // Near the beginning
  }

  // Field-specific bonuses
  if (field === 'title' && exactMatches > 0) {
    score += 0.5; // Title matches are very important
  } else if (field === 'tags' && exactMatches > 0) {
    score += 0.4; // Tag matches are important
  } else if (field === 'url' && content.includes(term)) {
    // URL matches get a small bonus for domain/path relevance
    const url = content;
    if (url.includes(`/${term}/`) || url.includes(`${term}.`)) {
      score += 0.2;
    }
  }

  return score;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Advanced search features
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      categories, 
      tags, 
      dateRange, 
      sortBy = 'relevance',
      limit = 20,
      offset = 0 
    } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
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
      return NextResponse.json({
        bookmarks: [],
        total: 0,
        query,
        filters: { categories, tags, dateRange, sortBy },
        limit,
        offset
      });
    }

    // Apply filters
    let filteredBookmarks = bookmarks;

    // Category filter
    if (categories && categories.length > 0) {
      filteredBookmarks = filteredBookmarks.filter(bookmark =>
        categories.includes(bookmark.category) || 
        (bookmark.ai_category && categories.includes(bookmark.ai_category))
      );
    }

    // Tags filter
    if (tags && tags.length > 0) {
      filteredBookmarks = filteredBookmarks.filter(bookmark => {
        const allTags = [...bookmark.tags, ...(bookmark.ai_tags || [])];
        return tags.some(tag => allTags.includes(tag));
      });
    }

    // Date range filter
    if (dateRange) {
      const { start, end } = dateRange;
      if (start || end) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => {
          const bookmarkDate = new Date(bookmark.created_at);
          const startDate = start ? new Date(start) : new Date('1970-01-01');
          const endDate = end ? new Date(end) : new Date();
          return bookmarkDate >= startDate && bookmarkDate <= endDate;
        });
      }
    }

    // Perform search on filtered bookmarks
    const searchResults = performSearch(query, filteredBookmarks);

    // Apply sorting
    if (sortBy === 'date') {
      searchResults.sort((a, b) => 
        new Date(b.bookmark.created_at).getTime() - new Date(a.bookmark.created_at).getTime()
      );
    } else if (sortBy === 'title') {
      searchResults.sort((a, b) => 
        a.bookmark.title.localeCompare(b.bookmark.title)
      );
    }
    // 'relevance' sorting is already applied by default

    // Apply pagination
    const paginatedResults = searchResults.slice(offset, offset + limit);

    return NextResponse.json({
      bookmarks: paginatedResults.map(result => ({
        ...result.bookmark,
        searchScore: result.score,
        matchedFields: result.matchedFields
      })),
      total: searchResults.length,
      query,
      filters: { categories, tags, dateRange, sortBy },
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      { error: 'Advanced search failed' },
      { status: 500 }
    );
  }
} 