import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// File-based storage for hierarchy assignments
const HIERARCHY_FILE = join(process.cwd(), 'data', 'hierarchy.json');

interface HierarchyAssignment {
  folderId: string;
  level: 'director' | 'teams' | 'collaborators';
  order: number;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load hierarchy assignments from file
async function loadHierarchyAssignments(): Promise<HierarchyAssignment[]> {
  try {
    await ensureDataDirectory();
    if (!existsSync(HIERARCHY_FILE)) {
      return [];
    }
    const data = await readFile(HIERARCHY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading hierarchy assignments:', error);
    return [];
  }
}

// Save hierarchy assignments to file
async function saveHierarchyAssignments(assignments: HierarchyAssignment[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(HIERARCHY_FILE, JSON.stringify(assignments, null, 2));
  } catch (error) {
    console.error('Error saving hierarchy assignments:', error);
    throw error;
  }
}

// GET: Fetch hierarchy assignments for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const assignments = await loadHierarchyAssignments();
    const userAssignments = assignments.filter(a => a.user_id === user_id);

    return NextResponse.json({
      success: true,
      assignments: userAssignments
    });
  } catch (error) {
    console.error('Error fetching hierarchy assignments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hierarchy assignments'
    }, { status: 500 });
  }
}

// POST: Create or update hierarchy assignments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignments, user_id } = body;

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!Array.isArray(assignments)) {
      return NextResponse.json({
        success: false,
        error: 'Assignments must be an array'
      }, { status: 400 });
    }

    // Load existing assignments
    const existingAssignments = await loadHierarchyAssignments();
    
    // Remove existing assignments for this user
    const otherUserAssignments = existingAssignments.filter(a => a.user_id !== user_id);
    
    // Add new assignments with timestamps
    const newAssignments = assignments.map((assignment: any) => ({
      ...assignment,
      user_id,
      createdAt: assignment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Combine and save
    const allAssignments = [...otherUserAssignments, ...newAssignments];
    await saveHierarchyAssignments(allAssignments);

    return NextResponse.json({
      success: true,
      message: 'Hierarchy assignments updated successfully',
      assignments: newAssignments
    });
  } catch (error) {
    console.error('Error updating hierarchy assignments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update hierarchy assignments'
    }, { status: 500 });
  }
}

// DELETE: Remove hierarchy assignments
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const folderId = searchParams.get('folderId');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const assignments = await loadHierarchyAssignments();
    
    let filteredAssignments;
    if (folderId) {
      // Remove specific folder assignment
      filteredAssignments = assignments.filter(a => 
        !(a.user_id === user_id && a.folderId === folderId)
      );
    } else {
      // Remove all assignments for user
      filteredAssignments = assignments.filter(a => a.user_id !== user_id);
    }

    await saveHierarchyAssignments(filteredAssignments);

    return NextResponse.json({
      success: true,
      message: 'Hierarchy assignments deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hierarchy assignments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete hierarchy assignments'
    }, { status: 500 });
  }
} 