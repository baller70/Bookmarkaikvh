import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, url } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
    
    console.log('🧪 Direct-Only API Test:');
    console.log('- URL:', supabaseUrl);
    console.log('- Key length:', supabaseKey?.length);
    console.log('- Key start:', supabaseKey?.substring(0, 30) + '...');
    
    const headers = {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey!,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    console.log('- Headers Authorization:', headers.Authorization.substring(0, 40) + '...');
    console.log('- Headers apikey:', headers.apikey.substring(0, 40) + '...');
    
    const payload = {
      title,
      url,
      user_id: null, // Use null to avoid FK constraints
      description: 'Direct API only test',
      category: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('- Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${supabaseUrl}/rest/v1/bookmarks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    console.log('- Response status:', response.status);
    console.log('- Response statusText:', response.statusText);
    
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('- Response headers:', JSON.stringify(responseHeaders, null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('- Error response body:', errorText);
      return NextResponse.json(
        { 
          error: 'Direct API failed', 
          status: response.status,
          statusText: response.statusText,
          details: errorText,
          headers: responseHeaders
        },
        { status: 500 }
      );
    }
    
    const result = await response.json();
    console.log('- Success result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Direct API worked!',
      bookmark: result[0] || result
    });
    
  } catch (error) {
    console.error('🧪 Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
