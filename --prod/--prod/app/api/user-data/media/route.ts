import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [],
    count: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
    success: true,
    message: 'Media library not configured - minimal working version'
  });
} 