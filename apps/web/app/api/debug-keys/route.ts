import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    
    // URL info
    supabaseUrl_exists: !!supabaseUrl,
    supabaseUrl_length: supabaseUrl?.length || 0,
    supabaseUrl_start: supabaseUrl?.substring(0, 30) + '...',
    supabaseUrl_full: supabaseUrl, // FULL URL for comparison
    
    // Service Role Key info
    serviceRoleKey_exists: !!serviceRoleKey,
    serviceRoleKey_length: serviceRoleKey?.length || 0,
    serviceRoleKey_start: serviceRoleKey?.substring(0, 30) + '...',
    serviceRoleKey_full: serviceRoleKey, // FULL KEY for comparison
    
    // Anon Key info
    anonKey_exists: !!anonKey,
    anonKey_length: anonKey?.length || 0,
    anonKey_start: anonKey?.substring(0, 30) + '...',
    anonKey_full: anonKey, // FULL KEY for comparison
    
    // Which key would be used
    selectedKey: serviceRoleKey || anonKey,
    selectedKey_length: (serviceRoleKey || anonKey)?.length || 0,
    
    timestamp: new Date().toISOString()
  });
}
