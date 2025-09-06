import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// File-based storage for hierarchy sections
const HIERARCHY_SECTIONS_FILE = join(process.cwd(), 'data', 'hierarchy-sections.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching hierarchy sections...');

    // Try to read from saved file first
    if (existsSync(HIERARCHY_SECTIONS_FILE)) {
      try {
        console.log('📂 Reading hierarchy sections from file...');
        const fileContent = await readFile(HIERARCHY_SECTIONS_FILE, 'utf8');
        const savedData = JSON.parse(fileContent);

        if (savedData.hierarchySections && Array.isArray(savedData.hierarchySections)) {
          console.log(`✅ Loaded ${savedData.hierarchySections.length} hierarchy sections from file`);
          return NextResponse.json({ hierarchySections: savedData.hierarchySections });
        }
      } catch (fileError) {
        console.warn('⚠️ Error reading hierarchy sections file, falling back to defaults:', fileError);
      }
    }

    // Fall back to default sections
    console.log('📝 Using default hierarchy sections');
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

    console.log(`📝 Saving ${hierarchySections.length} hierarchy sections to file storage...`);

    // Ensure data directory exists
    await ensureDataDirectory();

    // Save to file storage
    const dataToSave = {
      hierarchySections: hierarchySections,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    await writeFile(HIERARCHY_SECTIONS_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    console.log(`✅ Successfully saved ${hierarchySections.length} hierarchy sections to ${HIERARCHY_SECTIONS_FILE}`);

    return NextResponse.json({
      message: 'Hierarchy sections saved successfully',
      hierarchySections: hierarchySections,
      saved: true
    });

  } catch (error) {
    console.error('❌ Error in POST /api/hierarchy-sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

