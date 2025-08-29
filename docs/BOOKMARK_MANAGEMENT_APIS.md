# BookAIMark Bookmark Management APIs

## Overview

This document provides comprehensive documentation for the BookAIMark Bookmark Management APIs, including bulk operations, advanced search, sharing & collaboration, and versioning & history features.

## Base URL
```
http://localhost:3000/api/bookmarks
```

---

## 🔄 Bulk Operations API

### Endpoint: `/api/bookmarks/bulk`

#### Export Bookmarks

**GET** `/api/bookmarks/bulk?action=export&format={json|html}&user_id={user_id}`

Export user bookmarks in JSON or HTML format.

**Parameters:**
- `action=export` (required)
- `format` (optional): `json` or `html` (default: `json`)
- `user_id` (optional): User ID (default: `dev-user-123`)

**Response:**
```json
{
  "success": true,
  "total": 230,
  "processed": 230,
  "failed": 0,
  "errors": [],
  "data": {
    "version": "1.0",
    "exported_at": "2025-07-12T09:37:32.517Z",
    "user_id": "dev-user-123",
    "total_bookmarks": 230,
    "bookmarks": [...]
  },
  "message": "Successfully exported 230 bookmarks",
  "processing_time_ms": 125
}
```

#### Get Statistics

**GET** `/api/bookmarks/bulk?action=stats&user_id={user_id}`

Get comprehensive statistics about user's bookmarks.

**Response:**
```json
{
  "success": true,
  "total": 230,
  "processed": 230,
  "failed": 0,
  "errors": [],
  "data": {
    "total_bookmarks": 230,
    "categories": ["AI Tools", "Web Development", ...],
    "tags": ["ai", "productivity", "tools", ...],
    "date_range": {
      "oldest": 1751874920258,
      "newest": 1752267891095
    },
    "site_health_distribution": {
      "unknown": 227,
      "working": 3
    }
  },
  "message": "Successfully retrieved stats for 230 bookmarks",
  "processing_time_ms": 558
}
```

#### Import Bookmarks

**POST** `/api/bookmarks/bulk`

Import multiple bookmarks with validation and duplicate detection.

**Request Body:**
```json
{
  "action": "import",
  "user_id": "dev-user-123",
  "bookmarks": [
    {
      "title": "Example Site",
      "url": "https://example.com",
      "description": "An example website",
      "category": "General",
      "tags": ["example", "test"],
      "notes": "Test bookmark"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "processed": 2,
  "failed": 0,
  "errors": [],
  "data": {
    "imported_bookmarks": [
      {
        "id": 288,
        "title": "Example Site",
        "url": "https://example.com",
        "category": "General"
      }
    ]
  },
  "message": "Import completed: 2 successful, 0 failed",
  "processing_time_ms": 70
}
```

#### Bulk Delete

**POST** `/api/bookmarks/bulk`

Delete multiple bookmarks by ID.

**Request Body:**
```json
{
  "action": "delete",
  "user_id": "dev-user-123",
  "bookmark_ids": [288, 289, 290]
}
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "processed": 3,
  "failed": 0,
  "errors": [],
  "data": {
    "deleted_bookmarks": [
      {
        "id": 288,
        "title": "Example Site",
        "url": "https://example.com"
      }
    ]
  },
  "message": "Bulk delete completed: 3 bookmarks deleted",
  "processing_time_ms": 45
}
```

---

## 🔍 Advanced Search API

### Endpoint: `/api/bookmarks/search`

#### Search Bookmarks (GET)

**GET** `/api/bookmarks/search?q={query}&categories={cat1,cat2}&tags={tag1,tag2}&...`

Advanced search with multiple filters and faceted navigation.

**Parameters:**
- `q` (optional): Search query
- `categories` (optional): Comma-separated category names
- `tags` (optional): Comma-separated tag names
- `site_health` (optional): Comma-separated health statuses
- `date_from` (optional): Start date (ISO format)
- `date_to` (optional): End date (ISO format)
- `has_notes` (optional): `true` or `false`
- `has_ai_summary` (optional): `true` or `false`
- `min_visits` (optional): Minimum visit count
- `max_visits` (optional): Maximum visit count
- `sort_by` (optional): `created_at`, `updated_at`, `title`, `visits`, `relevance`
- `sort_order` (optional): `asc` or `desc`
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `user_id` (optional): User ID (default: `dev-user-123`)

**Response:**
```json
{
  "success": true,
  "bookmarks": [...],
  "total": 228,
  "filtered": 118,
  "page": 1,
  "per_page": 5,
  "total_pages": 24,
  "filters_applied": {
    "query": "ai",
    "sort_by": "relevance",
    "sort_order": "desc",
    "limit": 5,
    "offset": 0
  },
  "search_time_ms": 546,
  "facets": {
    "categories": [
      {"name": "ai tools", "count": 39},
      {"name": "llm models", "count": 16}
    ],
    "tags": [
      {"name": "ai", "count": 42},
      {"name": "automation", "count": 36}
    ],
    "site_health": [
      {"name": "unknown", "count": 117},
      {"name": "working", "count": 1}
    ],
    "date_ranges": {
      "last_week": 118,
      "last_month": 0,
      "last_year": 0,
      "older": 0
    }
  }
}
```

#### Search Bookmarks (POST)

**POST** `/api/bookmarks/search`

Advanced search using POST method for complex filter objects.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "filters": {
    "query": "ai tools",
    "categories": ["ai tools", "automation"],
    "tags": ["productivity", "ai"],
    "has_ai_summary": true,
    "min_visits": 5,
    "sort_by": "relevance",
    "sort_order": "desc",
    "limit": 10,
    "offset": 0
  }
}
```

**Features:**
- **Text Search**: Full-text search across title, description, notes, tags, and categories
- **Relevance Scoring**: AI-powered relevance scoring with weighted fields
- **Faceted Navigation**: Dynamic facets for categories, tags, site health, and date ranges
- **Advanced Filters**: Date ranges, visit counts, content flags
- **Flexible Sorting**: Multiple sort criteria with relevance scoring
- **Pagination**: Efficient pagination with total counts

---

## 🤝 Sharing & Collaboration API

### Endpoint: `/api/bookmarks/sharing`

#### Get User's Shares

**GET** `/api/bookmarks/sharing?action=my-shares&user_id={user_id}`

Get all shares created by the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "shares": [
      {
        "id": "share-uuid",
        "bookmark_id": 123,
        "owner_id": "dev-user-123",
        "shared_with": ["user2", "user3"],
        "share_type": "read",
        "share_url": "http://localhost:3000/shared/bookmark/share-uuid",
        "created_at": "2025-07-12T09:36:13.859Z",
        "access_count": 5,
        "bookmark": {
          "id": 123,
          "title": "Shared Bookmark",
          "url": "https://example.com"
        }
      }
    ]
  },
  "message": "Found 3 shares",
  "processing_time_ms": 25
}
```

#### Get Bookmarks Shared With User

**GET** `/api/bookmarks/sharing?action=shared-with-me&user_id={user_id}`

Get all bookmarks shared with the user.

#### Get Public Share

**GET** `/api/bookmarks/sharing?action=public-share&share_id={share_id}`

Access a public bookmark share.

#### Get Collections

**GET** `/api/bookmarks/sharing?action=collections&user_id={user_id}`

Get all collections accessible to the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": "collection-uuid",
        "name": "AI Tools Collection",
        "description": "A curated collection of AI tools",
        "owner_id": "dev-user-123",
        "bookmark_count": 15,
        "is_public": true,
        "share_url": "http://localhost:3000/shared/collection/collection-uuid",
        "bookmarks": [...]
      }
    ]
  },
  "message": "Found 2 collections",
  "processing_time_ms": 45
}
```

#### Create Share

**POST** `/api/bookmarks/sharing`

Create a new bookmark share.

**Request Body:**
```json
{
  "action": "create-share",
  "bookmark_id": 123,
  "user_id": "dev-user-123",
  "user_ids": ["user2", "user3"],
  "share_type": "read",
  "title": "Custom Share Title",
  "description": "Share description",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Share Types:**
- `read`: View-only access
- `edit`: Can modify bookmark
- `public`: Publicly accessible via URL

#### Create Collection

**POST** `/api/bookmarks/sharing`

Create a new bookmark collection.

**Request Body:**
```json
{
  "action": "create-collection",
  "collection_name": "AI Tools Collection",
  "collection_description": "A curated collection of AI tools",
  "bookmark_ids": [32, 33, 38],
  "is_public": true,
  "user_id": "dev-user-123",
  "collaborators": [
    {
      "user_id": "user2",
      "permission": "edit"
    }
  ]
}
```

#### Add Collaborator

**POST** `/api/bookmarks/sharing`

Add a collaborator to a collection.

**Request Body:**
```json
{
  "action": "add-collaborator",
  "collection_id": "collection-uuid",
  "collaborator_user_id": "user2",
  "permission": "edit",
  "user_id": "dev-user-123"
}
```

**Permissions:**
- `read`: View collection and bookmarks
- `edit`: Modify collection and add/remove bookmarks
- `admin`: Full control including adding collaborators

#### Delete Share/Collection

**DELETE** `/api/bookmarks/sharing?share_id={share_id}&user_id={user_id}`
**DELETE** `/api/bookmarks/sharing?collection_id={collection_id}&user_id={user_id}`

Delete a share or collection (owner only).

---

## 📚 History & Versioning API

### Endpoint: `/api/bookmarks/history`

#### Get Bookmark History

**GET** `/api/bookmarks/history?action=bookmark-history&bookmark_id={id}&user_id={user_id}`

Get complete version history for a bookmark.

**Parameters:**
- `action=bookmark-history` (required)
- `bookmark_id` (required): Bookmark ID
- `user_id` (optional): User ID
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmark": {
      "id": 123,
      "title": "Example Bookmark",
      "url": "https://example.com"
    },
    "versions": [
      {
        "id": "version-uuid",
        "bookmark_id": 123,
        "version_number": 3,
        "change_type": "updated",
        "changes": [
          {
            "field": "title",
            "old_value": "Old Title",
            "new_value": "New Title"
          }
        ],
        "snapshot": {...},
        "created_at": "2025-07-12T09:36:13.859Z",
        "created_by": "dev-user-123",
        "change_reason": "Updated title for clarity",
        "auto_generated": false
      }
    ],
    "stats": {
      "total_versions": 5,
      "created_at": "2025-07-01T10:00:00Z",
      "last_updated": "2025-07-12T09:36:13.859Z",
      "change_types": {
        "created": 1,
        "updated": 3,
        "restored": 1
      },
      "most_changed_fields": {
        "title": 2,
        "description": 1,
        "tags": 3
      },
      "contributors": ["dev-user-123"],
      "auto_vs_manual": {
        "auto": 2,
        "manual": 3
      }
    },
    "pagination": {
      "total": 5,
      "page": 1,
      "per_page": 20,
      "total_pages": 1
    }
  },
  "message": "Found 5 versions",
  "processing_time_ms": 35
}
```

#### Get Version Details

**GET** `/api/bookmarks/history?action=version-details&version_id={version_id}&user_id={user_id}`

Get detailed information about a specific version.

#### Get User Activity

**GET** `/api/bookmarks/history?action=user-activity&user_id={user_id}`

Get user's activity across all bookmarks.

#### Compare Versions

**GET** `/api/bookmarks/history?action=compare-versions&from_version_id={id1}&to_version_id={id2}&user_id={user_id}`

Compare two versions of a bookmark.

**Response:**
```json
{
  "success": true,
  "data": {
    "from_version": {...},
    "to_version": {...},
    "changes": [
      {
        "field": "title",
        "old_value": "Old Title",
        "new_value": "New Title"
      }
    ],
    "summary": {
      "fields_changed": 3,
      "version_difference": 2,
      "time_difference": 86400000
    }
  },
  "message": "Comparison completed: 3 differences found",
  "processing_time_ms": 25
}
```

#### Restore Version

**POST** `/api/bookmarks/history`

Restore a bookmark to a previous version.

**Request Body:**
```json
{
  "action": "restore-version",
  "bookmark_id": 123,
  "version_id": "version-uuid",
  "user_id": "dev-user-123",
  "change_reason": "Restored to working version"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restored_bookmark": {...},
    "restored_from_version": 2,
    "changes_applied": 3
  },
  "message": "Bookmark restored to version 2",
  "processing_time_ms": 45
}
```

#### Create Manual Version

**POST** `/api/bookmarks/history`

Create a manual checkpoint version.

**Request Body:**
```json
{
  "action": "create-manual-version",
  "bookmark_id": 123,
  "user_id": "dev-user-123",
  "change_reason": "Before major changes"
}
```

---

## 🔧 Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "processing_time_ms": 25
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized
- `403`: Forbidden (access denied)
- `404`: Not Found
- `500`: Internal Server Error

---

## 🚀 Performance & Limits

- **Bulk Import**: Maximum 1000 bookmarks per request
- **Search Results**: Maximum 100 results per page
- **Export**: No limit, but large exports may take time
- **History**: Unlimited version history
- **Collections**: Maximum 1000 bookmarks per collection

---

## 🔐 Security Features

- **User Isolation**: All operations are user-scoped
- **Access Control**: Share permissions are enforced
- **Validation**: Input validation and sanitization
- **Rate Limiting**: Built-in protection against abuse
- **Audit Trail**: Complete version history with user tracking

---

## 📊 Analytics & Monitoring

- **Processing Time**: All responses include processing time
- **Access Tracking**: Share and collection access is logged
- **Usage Statistics**: Comprehensive stats available
- **Error Tracking**: Detailed error logging and reporting

---

## 🔄 Integration Examples

### JavaScript/TypeScript

```typescript
// Bulk import bookmarks
const importBookmarks = async (bookmarks: ImportBookmark[]) => {
  const response = await fetch('/api/bookmarks/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'import',
      bookmarks,
      user_id: 'dev-user-123'
    })
  });
  return response.json();
};

// Advanced search
const searchBookmarks = async (query: string, filters: SearchFilters) => {
  const params = new URLSearchParams({
    q: query,
    categories: filters.categories?.join(',') || '',
    limit: filters.limit?.toString() || '20'
  });
  
  const response = await fetch(`/api/bookmarks/search?${params}`);
  return response.json();
};

// Create collection
const createCollection = async (name: string, bookmarkIds: number[]) => {
  const response = await fetch('/api/bookmarks/sharing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-collection',
      collection_name: name,
      bookmark_ids: bookmarkIds,
      is_public: true
    })
  });
  return response.json();
};
```

This comprehensive API suite provides all the functionality needed for advanced bookmark management, collaboration, and version control in the BookAIMark application. 