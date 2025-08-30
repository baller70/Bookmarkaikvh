import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, url } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🧪 Testing direct Supabase REST API call');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', anonKey?.length);
    
    // Test direct REST API call (same approach that worked in terminal)
    const response = await fetch(`${supabaseUrl}/rest/v1/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey!,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        title,
        url,
        user_id: '00000000-0000-0000-0000-000000000001',
        description: 'Test bookmark via direct API',
        category: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    
    console.log('🧪 Direct API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('🧪 Direct API Error:', errorText);
      return NextResponse.json(
        { error: 'Direct API failed', details: errorText, status: response.status },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Direct API call worked!' });
    
  } catch (error) {
    console.error('🧪 Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
