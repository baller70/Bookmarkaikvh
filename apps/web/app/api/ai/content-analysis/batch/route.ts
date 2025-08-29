import { NextRequest, NextResponse } from 'next/server';
import { contentAnalysisService } from '@/lib/ai/content-analysis';
// // import { performanceUtils } from '../../../../../../../frontend/lib/monitoring/performance-enhanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookmarks, options } = body;

    // Validate input
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return NextResponse.json({
        error: 'Bookmarks array is required and must not be empty'
      }, { status: 400 });
    }

    if (bookmarks.length > 50) {
      return NextResponse.json({
        error: 'Maximum 50 bookmarks allowed per batch'
      }, { status: 400 });
    }

    // Validate bookmark structure
    for (const bookmark of bookmarks) {
      if (!bookmark.url && !bookmark.content) {
        return NextResponse.json({
          error: 'Each bookmark must have either url or content'
        }, { status: 400 });
      }
    }

    // Convert bookmarks to ContentMetadata format
    const contentList = bookmarks.map(bookmark => ({
      title: bookmark.title || 'Untitled',
      url: bookmark.url || 'direct-content',
      content: bookmark.content || bookmark.description || bookmark.title || '',
      author: bookmark.author,
      publishDate: bookmark.publishDate,
      wordCount: bookmark.content ? bookmark.content.split(/\s+/).length : 0
    }));

    const results = await contentAnalysisService.analyzeContentBatch(contentList, options);

    // Combine results with original bookmark data
    const combinedResults = bookmarks.map((bookmark, index) => ({
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description
      },
      analysis: results[index] || null
    }));

    return NextResponse.json({
      success: true,
      results: combinedResults,
      totalProcessed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch content analysis API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Batch content analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urls = searchParams.get('urls');

    if (!urls) {
      return NextResponse.json({
        error: 'URLs parameter is required (comma-separated list)'
      }, { status: 400 });
    }

    const urlList = urls.split(',').map(url => url.trim()).filter(url => url);
    
    if (urlList.length === 0) {
      return NextResponse.json({
        error: 'At least one valid URL is required'
      }, { status: 400 });
    }

    if (urlList.length > 20) {
      return NextResponse.json({
        error: 'Maximum 20 URLs allowed per batch GET request'
      }, { status: 400 });
    }

    // Extract content from URLs first
    const contentExtractionPromises = urlList.map(async (url) => {
      try {
        const metadata = await contentAnalysisService.extractContentFromUrl(url);
        return metadata;
      } catch (error) {
        console.error('Failed to extract content from URL:', { url: url.substring(0, 100), error });
        return {
          title: 'Content Extraction Failed',
          url,
          content: 'Unable to extract content from this URL.',
          wordCount: 0
        };
      }
    });

    const contentList = await Promise.all(contentExtractionPromises);
    const results = await contentAnalysisService.analyzeContentBatch(contentList);

    // Combine results with URLs
    const combinedResults = urlList.map((url, index) => ({
      url,
      analysis: results[index] || null
    }));

    return NextResponse.json({
      success: true,
      results: combinedResults,
      totalProcessed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch content analysis GET API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Batch content analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}    