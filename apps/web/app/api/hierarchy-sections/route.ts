import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching hierarchy sections...');

    // Always return default sections for now since this is a UI component
    // that doesn't need user-specific customization for Goal 2.0 folders
    console.log('📝 Returning default hierarchy sections');
    const defaultSections = [
      {
        id: 'director',
        section_id: 'director',
        title: 'DIRECTOR',
        icon: 'Crown',
        color: 'purple',
        gradient: 'bg-gradient-to-r from-purple-600 to-blue-600',
        position: 0
      },
      {
        id: 'teams',
        section_id: 'teams',
        title: 'TEAMS',
        icon: 'Users',
        color: 'emerald',
        gradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
        position: 1
      },
      {
        id: 'collaborators',
        section_id: 'collaborators',
        title: 'COLLABORATORS',
        icon: 'User',
        color: 'orange',
        gradient: 'bg-gradient-to-r from-orange-600 to-red-600',
        position: 2
      }
    ];

    console.log(`✅ Returning ${defaultSections.length} default hierarchy sections`);
    return NextResponse.json({ hierarchySections: defaultSections });

  } catch (error) {
    console.error('❌ Error in GET /api/hierarchy-sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/hierarchy-sections - Starting request processing');

    console.log('📦 Parsing request body...');
    const body = await request.json();
    const { hierarchySections } = body;

    if (!hierarchySections || !Array.isArray(hierarchySections)) {
      return NextResponse.json(
        { error: 'Invalid hierarchy sections data' },
        { status: 400 }
      );
    }

    // For now, just return success without saving to database
    // since we're using default sections for the Goal 2.0 feature
    console.log(`✅ Received ${hierarchySections.length} hierarchy sections (not saving - using defaults)`);
    return NextResponse.json({
      message: 'Hierarchy sections received successfully (using defaults)',
      hierarchySections: hierarchySections
    });

  } catch (error) {
    console.error('❌ Error in POST /api/hierarchy-sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

