import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching hierarchy sections...');

    // For development/testing, use existing user ID from database
    const existingUserId = '48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f';
    const userId = existingUserId;
    console.log(`[API] Using existing userId: ${userId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: hierarchySections, error } = await supabase
      .from('hierarchy_sections')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) {
      console.error('❌ Error fetching hierarchy sections:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no custom sections exist, return default sections
    if (!hierarchySections || hierarchySections.length === 0) {
      console.log('📝 No custom hierarchy sections found, returning defaults');
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
      return NextResponse.json({ hierarchySections: defaultSections });
    }

    console.log(`✅ Found ${hierarchySections.length} hierarchy sections`);
    return NextResponse.json({ hierarchySections });

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

    // For development/testing, use existing user ID from database
    const existingUserId = '48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f';
    const userId = existingUserId;
    console.log(`[API] Using existing userId: ${userId}`);

    console.log('📦 Parsing request body...');
    const body = await request.json();
    const { hierarchySections } = body;

    if (!hierarchySections || !Array.isArray(hierarchySections)) {
      return NextResponse.json(
        { error: 'Invalid hierarchy sections data' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete existing sections for this user
    const { error: deleteError } = await supabase
      .from('hierarchy_sections')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Error deleting existing hierarchy sections:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new sections
    const sectionsToInsert = hierarchySections.map((section, index) => ({
      user_id: userId,
      section_id: section.id || section.section_id,
      title: section.title,
      icon: section.icon || 'Crown',
      color: section.color || 'purple',
      gradient: section.gradient || 'bg-gradient-to-r from-purple-600 to-blue-600',
      position: index
    }));

    const { data, error } = await supabase
      .from('hierarchy_sections')
      .insert(sectionsToInsert)
      .select();

    if (error) {
      console.error('❌ Error saving hierarchy sections:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Successfully saved ${data.length} hierarchy sections`);
    return NextResponse.json({ 
      message: 'Hierarchy sections saved successfully',
      hierarchySections: data 
    });

  } catch (error) {
    console.error('❌ Error in POST /api/hierarchy-sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

