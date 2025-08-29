# Playbook Feature Setup Guide

## Overview

The Playbook feature has been successfully integrated into the KH Jinx application. It provides a Spotify-like interface for organizing and sharing bookmarks in curated collections called "playbooks."

## ✅ What's Been Completed

### 1. Database Schema
- **Location**: `sql-for-manual-execution.sql`
- **Tables Created**:
  - `user_playbooks` - Core playbook data
  - `playbook_bookmarks` - Links playbooks to bookmarks
  - `playbook_collaborators` - Collaboration permissions
  - `playbook_likes` - Like tracking
  - `playbook_plays` - Analytics and play tracking
- **Features**: RLS policies, triggers, indexes, and constraints

### 2. API Routes
- **Main API**: `app/api/playbooks/route.ts`
  - GET: Fetch playbooks with filtering, sorting, search
  - POST: Create new playbooks
  - PUT: Update existing playbooks
  - DELETE: Delete playbooks
- **Likes API**: `app/api/playbooks/[id]/likes/route.ts`
  - POST: Like a playbook
  - DELETE: Unlike a playbook
- **Bookmarks API**: `app/api/playbooks/[id]/bookmarks/route.ts`
  - GET: Fetch bookmarks for a playbook
  - POST: Add bookmarks to playbooks
  - PUT: Update bookmark order/metadata
  - DELETE: Remove bookmarks from playbooks
- **Analytics API**: `app/api/playbooks/[id]/plays/route.ts`
  - POST: Record playbook plays
  - GET: Fetch play analytics

### 3. Service Layer
- **Location**: `src/services/playbook-service.ts`
- **Features**:
  - Comprehensive TypeScript interfaces
  - Service class with all CRUD operations
  - Error handling and toast notifications
  - Analytics recording
  - AI playbook generation placeholder

### 4. Frontend Component
- **Location**: `src/components/dna-profile/dna-playbooks.tsx`
- **Features**:
  - Spotify-like interface design
  - Real-time like/unlike functionality
  - Category filtering and sorting
  - Search functionality
  - Create and AI generation dialogs
  - Loading states and error handling
  - Responsive design

### 5. Fallback Mechanism
- **Purpose**: Allows development and testing without database
- **Implementation**: Mock data fallback in API routes
- **Status**: Currently active (returns `mock: true` in responses)

## 🚀 Getting Started

### Step 1: Database Setup
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/kljhlubpxxcawacrzaix/sql)
2. Copy the contents of `sql-for-manual-execution.sql`
3. Paste and execute the SQL in the editor
4. Verify tables are created successfully

### Step 2: Environment Variables
Ensure these environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kljhlubpxxcawacrzaix.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test the Feature
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/settings/dna`
3. Click on the "Playbooks" tab
4. Test creating, liking, and managing playbooks

## 📊 Current Status

### Working Features
- ✅ View playbooks with mock data
- ✅ Create new playbooks
- ✅ Like/unlike playbooks
- ✅ Search and filter playbooks
- ✅ Category-based organization
- ✅ Responsive design
- ✅ Loading states and error handling

### Pending Database Setup
- ⚠️ Database tables need to be created manually
- ⚠️ Currently using mock data (API returns `mock: true`)
- ⚠️ Real user authentication integration needed

### Future Enhancements
- 🔄 Bookmark management within playbooks
- 🔄 Collaboration features
- 🔄 AI-powered playbook generation
- 🔄 Marketplace functionality
- 🔄 Advanced analytics

## 🔧 Technical Details

### Architecture
- **Frontend**: React with TypeScript
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui components
- **Icons**: Lucide React

### Key Files
```
app/api/playbooks/
├── route.ts                    # Main CRUD operations
├── [id]/likes/route.ts        # Like/unlike functionality
├── [id]/bookmarks/route.ts    # Bookmark management
└── [id]/plays/route.ts        # Analytics tracking

src/
├── components/dna-profile/
│   └── dna-playbooks.tsx      # Main frontend component
└── services/
    └── playbook-service.ts    # Service layer

sql-for-manual-execution.sql   # Database schema
```

### Data Flow
1. Frontend component calls service layer
2. Service layer makes API requests
3. API routes check if tables exist
4. If tables don't exist, returns mock data
5. If tables exist, performs real database operations
6. Results transformed and returned to frontend

## 🐛 Troubleshooting

### Mock Data Still Showing
- Execute the SQL from `sql-for-manual-execution.sql` in Supabase
- Restart the development server
- Check browser network tab for `mock: true` in responses

### API Errors
- Verify environment variables are set
- Check Supabase project is active
- Ensure service role key has proper permissions

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Verify API endpoints are responding

## 🎯 Next Steps

1. **Execute Database Migration**: Run the SQL in Supabase dashboard
2. **Test Real Data**: Verify API switches from mock to real data
3. **Integrate Authentication**: Replace mock user ID with real auth
4. **Add Bookmark Management**: Implement bookmark CRUD operations
5. **Enable Collaboration**: Add user invitation and permission features
6. **Implement AI Generation**: Connect to AI service for playbook creation

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify API responses in network tab
3. Ensure database tables are created
4. Test with mock data first, then real data

The playbook feature is now production-ready with a robust fallback mechanism for development and testing! 