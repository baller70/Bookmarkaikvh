# User Management APIs Documentation

## Overview

The User Management APIs provide comprehensive functionality for managing user profiles, preferences, subscriptions, analytics, and privacy controls. These APIs are designed to support GDPR compliance, subscription management, user analytics, and privacy controls.

## Base URL
```
http://localhost:3000/api/users
```

---

## 📋 User Profile Management

### GET /api/users
Get user profile information with optional field filtering.

**Query Parameters:**
- `user_id` (string, optional): User ID (defaults to 'dev-user-123')
- `include` (string, optional): Comma-separated list of fields to include

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dev-user-123",
    "email": "dev-user-123@example.com",
    "full_name": "John Doe",
    "username": "johndoe",
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "website": "https://johndoe.dev",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "language": "en",
    "theme": "dark",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "last_login": "2025-01-01T00:00:00.000Z",
    "email_verified": true,
    "phone": "+1234567890",
    "phone_verified": true,
    "two_factor_enabled": false,
    "notification_preferences": {
      "email_notifications": true,
      "push_notifications": true,
      "marketing_emails": false,
      "product_updates": true,
      "security_alerts": true
    },
    "privacy_settings": {
      "profile_visibility": "private",
      "data_sharing": false,
      "analytics_tracking": true,
      "personalized_ads": false
    },
    "subscription": {
      "plan": "pro",
      "status": "active",
      "billing_cycle": "monthly",
      "next_billing_date": "2025-02-01T00:00:00.000Z",
      "features": ["unlimited_bookmarks", "ai_categorization"]
    },
    "usage_stats": {
      "bookmarks_count": 1250,
      "categories_count": 25,
      "tags_count": 150,
      "ai_processing_count": 500,
      "storage_used_mb": 125,
      "api_calls_count": 2500
    },
    "preferences": {
      "default_category": "Technology",
      "auto_categorization": true,
      "auto_tagging": true,
      "ai_suggestions": true,
      "duplicate_detection": true,
      "bookmark_sync": true,
      "export_format": "json",
      "items_per_page": 20,
      "sort_order": "newest"
    }
  },
  "message": "User profile retrieved successfully"
}
```

### POST /api/users
Create a new user profile.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "username": "newuser"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "full_name": "New User",
    "username": "newuser",
    // ... other default profile fields
  },
  "message": "User profile created successfully"
}
```

### PUT /api/users
Update user profile information.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "full_name": "Updated Name",
  "bio": "Updated bio",
  "notification_preferences": {
    "email_notifications": false,
    "push_notifications": true
  },
  "preferences": {
    "auto_categorization": false,
    "items_per_page": 50
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated user profile
  },
  "message": "User profile updated successfully"
}
```

### DELETE /api/users
Delete or deactivate user profile.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `hard_delete` (boolean, optional): Whether to permanently delete (default: false)

**Response:**
```json
{
  "success": true,
  "message": "User permanently deleted successfully"
}
```

---

## 💳 Subscription Management

### GET /api/users/subscription
Get user subscription details and billing information.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `include_history` (boolean, optional): Include billing history

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-123",
      "user_id": "dev-user-123",
      "plan": "pro",
      "status": "active",
      "billing_cycle": "monthly",
      "price_per_cycle": 9.99,
      "currency": "USD",
      "trial_ends_at": "2025-01-15T00:00:00.000Z",
      "current_period_start": "2025-01-01T00:00:00.000Z",
      "current_period_end": "2025-02-01T00:00:00.000Z",
      "cancel_at_period_end": false,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "features": ["unlimited_bookmarks", "ai_categorization"],
      "usage_limits": {
        "bookmarks": 10000,
        "ai_processing": 1000,
        "storage_mb": 1000,
        "api_calls": 10000
      }
    },
    "plan_config": {
      "name": "Pro",
      "price": 9.99,
      "features": ["unlimited_bookmarks", "ai_categorization"],
      "limits": {
        "bookmarks": 10000,
        "ai_processing": 1000,
        "storage_mb": 1000,
        "api_calls": 10000
      }
    }
  },
  "message": "Subscription details retrieved successfully"
}
```

### POST /api/users/subscription
Create or upgrade subscription.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "plan": "pro",
  "billing_cycle": "monthly",
  "payment_method_id": "pm_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      // New subscription details
    },
    "plan_config": {
      // Plan configuration
    }
  },
  "message": "Subscription created successfully"
}
```

### PUT /api/users/subscription
Update subscription settings.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "action": "cancel",
  // or "reactivate", "update_billing_cycle", "update_payment_method"
  "billing_cycle": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      // Updated subscription
    }
  },
  "message": "Subscription updated successfully"
}
```

### DELETE /api/users/subscription
Cancel subscription.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `immediate` (boolean, optional): Cancel immediately vs. at period end

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

## 📊 User Analytics

### GET /api/users/analytics
Get user analytics and insights.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `period` (string, optional): 'daily', 'weekly', 'monthly', 'yearly'
- `start_date` (string, optional): Start date (YYYY-MM-DD)
- `end_date` (string, optional): End date (YYYY-MM-DD)
- `include_activity` (boolean, optional): Include recent activity
- `include_sessions` (boolean, optional): Include session data

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "user_id": "dev-user-123",
      "period": "weekly",
      "date": "2025-01-01",
      "metrics": {
        "bookmarks_added": 25,
        "bookmarks_deleted": 2,
        "bookmarks_edited": 15,
        "bookmarks_visited": 150,
        "categories_created": 3,
        "tags_created": 12,
        "ai_processing_used": 45,
        "search_queries": 75,
        "time_spent_minutes": 420,
        "api_calls": 200,
        "storage_used_mb": 125,
        "login_count": 5,
        "feature_usage": {
          "bookmark_created": 25,
          "search_performed": 75,
          "ai_categorization": 45
        }
      },
      "insights": {
        "most_used_category": "Technology",
        "most_used_tags": ["react", "javascript", "ai", "development"],
        "peak_usage_hour": 14,
        "productivity_score": 85,
        "engagement_level": "high",
        "growth_rate": 15
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  },
  "message": "User analytics retrieved successfully"
}
```

### POST /api/users/analytics
Track user activity.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "action": "bookmark_created",
  "category": "bookmark",
  "details": {
    "bookmark_id": "bookmark-123",
    "category": "Technology",
    "tags": ["react", "javascript"]
  },
  "session_id": "session-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity_id": "activity-123"
  },
  "message": "Activity tracked successfully"
}
```

### PUT /api/users/analytics
Manage user sessions.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "action": "start_session"
  // or "end_session" with session_id
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session-123"
  },
  "message": "Session started successfully"
}
```

---

## 🔒 Privacy & Consent Management

### GET /api/users/privacy
Get user privacy settings and consent status.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `include` (string, optional): 'data_requests', 'consent_history'

**Response:**
```json
{
  "success": true,
  "data": {
    "consent_status": {
      "has_current_consent": true,
      "current_version": "v1.1",
      "user_version": "v1.1",
      "consents": {
        "essential": true,
        "analytics": true,
        "marketing": false,
        "personalization": true,
        "third_party_sharing": false,
        "data_processing": true,
        "cookies": true,
        "email_communications": true,
        "push_notifications": true
      },
      "last_updated": "2025-01-01T00:00:00.000Z"
    },
    "privacy_settings": {
      "user_id": "dev-user-123",
      "profile_visibility": "private",
      "data_sharing": {
        "analytics": true,
        "marketing": false,
        "research": false,
        "third_parties": false
      },
      "data_retention": {
        "activity_logs_days": 365,
        "deleted_items_days": 30,
        "session_data_days": 90
      },
      "communication_preferences": {
        "email_notifications": true,
        "push_notifications": true,
        "sms_notifications": false,
        "marketing_emails": false,
        "product_updates": true,
        "security_alerts": true
      },
      "cookie_preferences": {
        "essential": true,
        "functional": true,
        "analytics": true,
        "marketing": false
      },
      "data_processing_purposes": ["service_provision", "account_management", "security"],
      "third_party_integrations": {
        "google_analytics": true,
        "stripe": true,
        "mailchimp": false
      }
    },
    "consent_requirements": {
      "version": "v1.1",
      "effective_date": "2024-06-01",
      "required_consents": ["essential", "data_processing", "cookies"],
      "optional_consents": ["analytics", "marketing", "personalization"]
    }
  },
  "message": "Privacy settings retrieved successfully"
}
```

### POST /api/users/privacy
Record consent or create data requests.

**Record Consent:**
```json
{
  "user_id": "dev-user-123",
  "action": "record_consent",
  "consents": {
    "essential": true,
    "data_processing": true,
    "cookies": true,
    "analytics": true,
    "marketing": false
  }
}
```

**Data Request:**
```json
{
  "user_id": "dev-user-123",
  "action": "data_request",
  "type": "export",
  "details": "User requested complete data export",
  "reason": "GDPR compliance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "request-123",
    "type": "export",
    "status": "processing",
    "requested_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Data export request submitted successfully"
}
```

### PUT /api/users/privacy
Update privacy settings.

**Request Body:**
```json
{
  "user_id": "dev-user-123",
  "profile_visibility": "public",
  "data_sharing": {
    "analytics": false,
    "marketing": false
  },
  "communication_preferences": {
    "email_notifications": false,
    "marketing_emails": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated privacy settings
  },
  "message": "Privacy settings updated successfully"
}
```

### DELETE /api/users/privacy
Withdraw consent or delete privacy data.

**Query Parameters:**
- `user_id` (string, optional): User ID
- `action` (string, optional): 'withdraw_consent' or 'delete_privacy_data'

**Response:**
```json
{
  "success": true,
  "message": "All consents withdrawn successfully"
}
```

---

## 📋 Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
  last_login?: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  notification_preferences: NotificationPreferences;
  privacy_settings: PrivacySettings;
  subscription: SubscriptionSummary;
  usage_stats: UsageStats;
  preferences: UserPreferences;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
  billing_cycle: 'monthly' | 'yearly';
  price_per_cycle: number;
  currency: string;
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  features: string[];
  usage_limits: UsageLimits;
}
```

### User Analytics
```typescript
interface UserAnalytics {
  user_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  metrics: AnalyticsMetrics;
  insights: AnalyticsInsights;
  created_at: string;
  updated_at: string;
}
```

### Privacy Settings
```typescript
interface PrivacySettings {
  user_id: string;
  profile_visibility: 'public' | 'private' | 'friends_only';
  data_sharing: DataSharingSettings;
  data_retention: DataRetentionSettings;
  communication_preferences: CommunicationPreferences;
  cookie_preferences: CookiePreferences;
  data_processing_purposes: string[];
  third_party_integrations: Record<string, boolean>;
}
```

---

## 🔧 Integration Examples

### JavaScript/TypeScript
```javascript
// Get user profile
const response = await fetch('/api/users?user_id=dev-user-123');
const { data: user } = await response.json();

// Update preferences
await fetch('/api/users', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'dev-user-123',
    preferences: {
      auto_categorization: false,
      items_per_page: 50
    }
  })
});

// Track activity
await fetch('/api/users/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'dev-user-123',
    action: 'bookmark_created',
    category: 'bookmark',
    details: { bookmark_id: 'bookmark-123' }
  })
});

// Record consent
await fetch('/api/users/privacy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'dev-user-123',
    action: 'record_consent',
    consents: {
      essential: true,
      analytics: true,
      marketing: false
    }
  })
});
```

### Python
```python
import requests

# Get analytics
response = requests.get(
    'http://localhost:3000/api/users/analytics',
    params={
        'user_id': 'dev-user-123',
        'period': 'weekly',
        'include_activity': 'true'
    }
)
analytics = response.json()['data']

# Upgrade subscription
response = requests.post(
    'http://localhost:3000/api/users/subscription',
    json={
        'user_id': 'dev-user-123',
        'plan': 'pro',
        'billing_cycle': 'monthly'
    }
)
subscription = response.json()['data']

# Create data request
response = requests.post(
    'http://localhost:3000/api/users/privacy',
    json={
        'user_id': 'dev-user-123',
        'action': 'data_request',
        'type': 'export',
        'details': 'GDPR data export request'
    }
)
request_id = response.json()['data']['id']
```

---

## 🚨 Error Handling

### Common Error Responses
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

### Error Codes
- `USER_NOT_FOUND` (404): User does not exist
- `INVALID_PLAN` (400): Invalid subscription plan
- `USERNAME_TAKEN` (409): Username already exists
- `MISSING_CONSENT` (400): Required consent not provided
- `INVALID_REQUEST_TYPE` (400): Invalid data request type
- `SUBSCRIPTION_NOT_FOUND` (404): No active subscription found

---

## 🔐 Security & Rate Limiting

### Authentication
All endpoints support user identification through:
- Query parameter: `user_id`
- Request body: `user_id`
- Default fallback: `dev-user-123` (development)

### Rate Limiting
- Profile operations: 100 requests/hour per user
- Analytics tracking: 1000 requests/hour per user
- Privacy operations: 50 requests/hour per user
- Subscription operations: 20 requests/hour per user

### Data Protection
- All sensitive data is encrypted at rest
- GDPR compliance with data retention policies
- Audit logging for all privacy-related operations
- Secure data export with expiring download links

---

## 📈 Performance & Monitoring

### Response Times
- Profile operations: < 200ms
- Analytics queries: < 500ms
- Subscription operations: < 300ms
- Privacy operations: < 400ms

### Monitoring
- Real-time API performance tracking
- User activity analytics
- Subscription conversion metrics
- Privacy compliance monitoring

### Caching
- User profiles: 5 minutes
- Analytics data: 1 hour
- Privacy settings: 30 minutes
- Subscription data: 15 minutes

---

## 🧪 Testing

### Test Coverage
All endpoints have been tested with:
- ✅ User profile CRUD operations
- ✅ Subscription management (create, upgrade, cancel)
- ✅ Analytics tracking and insights
- ✅ Privacy consent recording
- ✅ Data request processing
- ✅ Error handling and validation

### Sample Test Commands
```bash
# Test user profile
curl -X GET "http://localhost:3000/api/users?user_id=dev-user-123"

# Test subscription
curl -X POST "http://localhost:3000/api/users/subscription" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "dev-user-123", "plan": "pro"}'

# Test analytics
curl -X POST "http://localhost:3000/api/users/analytics" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "dev-user-123", "action": "bookmark_created", "category": "bookmark"}'

# Test privacy
curl -X POST "http://localhost:3000/api/users/privacy" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "dev-user-123", "action": "record_consent", "consents": {"essential": true}}'
```

The User Management APIs provide a comprehensive foundation for user profile management, subscription billing, analytics tracking, and privacy compliance in the BookAIMark application. 