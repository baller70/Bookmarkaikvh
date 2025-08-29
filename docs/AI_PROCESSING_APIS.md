# BookAIMark AI Processing APIs

## Overview

This document provides comprehensive documentation for the BookAIMark AI Processing APIs, including enhanced auto-processing, batch processing capabilities, queue management, and AI accuracy feedback system.

## Base URL
```
http://localhost:3000/api/ai/processing
```

---

## 🤖 Main Processing API

### Endpoint: `/api/ai/processing`

#### Create Processing Job

**POST** `/api/ai/processing`

Create a new AI processing job for single or batch bookmark analysis.

**Request Body:**
```json
{
  "action": "create-job",
  "user_id": "dev-user-123",
  "items": [
    {
      "url": "https://example.com",
      "title": "Optional existing title",
      "content": "Optional existing content",
      "description": "Optional existing description",
      "existing_tags": ["tag1", "tag2"],
      "existing_category": "Optional existing category"
    }
  ],
  "settings": {
    "auto_categorize": true,
    "auto_tag": true,
    "extract_content": true,
    "generate_summary": true,
    "detect_language": true,
    "quality_score": true,
    "duplicate_detection": true,
    "sentiment_analysis": false,
    "keyword_extraction": true,
    "content_enhancement": false,
    "confidence_threshold": 0.5,
    "max_tags": 8,
    "max_summary_length": 300,
    "language_preference": "en"
  },
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "job_id": "df2af379-ff2c-4d5b-8a41-67a04650aa08",
  "status": "pending",
  "estimated_duration": 5000,
  "items_count": 1,
  "message": "Processing job created and started",
  "processing_time_ms": 11
}
```

#### Get Job Status

**GET** `/api/ai/processing?action=status&job_id={job_id}&user_id={user_id}`

Get the current status of a processing job.

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "df2af379-ff2c-4d5b-8a41-67a04650aa08",
    "status": "processing",
    "progress": {
      "total": 10,
      "processed": 3,
      "failed": 0,
      "current_item": "https://example.com"
    },
    "created_at": "2025-07-12T10:00:00Z",
    "started_at": "2025-07-12T10:00:05Z",
    "estimated_duration": 50000,
    "actual_duration": null
  },
  "processing_time_ms": 5
}
```

#### Get User Jobs

**GET** `/api/ai/processing?action=jobs&user_id={user_id}&status={status}&limit={limit}&offset={offset}`

Get all processing jobs for a user with optional filtering.

**Parameters:**
- `status` (optional): Filter by job status (`pending`, `processing`, `completed`, `failed`, `cancelled`)
- `limit` (optional): Number of results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-uuid",
      "type": "batch",
      "status": "completed",
      "priority": "normal",
      "progress": {
        "total": 10,
        "processed": 10,
        "failed": 0
      },
      "created_at": "2025-07-12T10:00:00Z",
      "completed_at": "2025-07-12T10:05:00Z",
      "estimated_duration": 50000,
      "actual_duration": 45000,
      "input_count": 10,
      "success_count": 10
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "processing_time_ms": 12
}
```

#### Get Job Results

**GET** `/api/ai/processing?action=results&job_id={job_id}&user_id={user_id}`

Get detailed results from a completed processing job.

**Response:**
```json
{
  "success": true,
  "job_id": "job-uuid",
  "results": [
    {
      "item_id": "item-uuid",
      "status": "success",
      "original_url": "https://example.com",
      "extracted_content": {
        "title": "Example Article",
        "description": "Article description",
        "text_content": "Full article content...",
        "word_count": 1500,
        "reading_time": 8,
        "author": "John Doe",
        "publish_date": "2025-07-10"
      },
      "ai_analysis": {
        "category": {
          "name": "Technology",
          "confidence": 0.92,
          "reasoning": "Article discusses AI and machine learning topics"
        },
        "tags": [
          {
            "name": "artificial intelligence",
            "confidence": 0.95,
            "reasoning": "Primary topic of the article"
          },
          {
            "name": "machine learning",
            "confidence": 0.88,
            "reasoning": "Extensively covered in the content"
          }
        ],
        "summary": {
          "text": "This article explores the latest developments in AI...",
          "key_points": [
            "AI adoption is accelerating",
            "New ML techniques show promise"
          ],
          "confidence": 0.85
        },
        "language": {
          "detected": "en",
          "confidence": 0.99
        },
        "quality_score": {
          "score": 85,
          "factors": {
            "content_depth": 0.9,
            "readability": 0.8,
            "authority": 0.85,
            "freshness": 0.9
          },
          "reasoning": "High-quality content with good depth and readability"
        },
        "sentiment": {
          "score": 0.3,
          "label": "positive",
          "confidence": 0.75
        },
        "keywords": {
          "primary": ["AI", "machine learning", "technology"],
          "secondary": ["automation", "algorithms", "data"],
          "entities": ["OpenAI", "Google", "Microsoft"]
        },
        "content_type": {
          "type": "article",
          "confidence": 0.9
        }
      },
      "duplicate_check": {
        "status": "unique",
        "matches": []
      },
      "processing_time_ms": 4500
    }
  ],
  "summary": {
    "total_items": 10,
    "successful": 10,
    "failed": 0,
    "skipped": 0,
    "processing_time_ms": 45000,
    "categories_found": {
      "Technology": 5,
      "Business": 3,
      "Science": 2
    },
    "tags_generated": {
      "AI": 8,
      "machine learning": 6,
      "automation": 4
    },
    "languages_detected": {
      "en": 9,
      "es": 1
    },
    "quality_distribution": {
      "high": 7,
      "medium": 2,
      "low": 1
    },
    "duplicates_found": 1,
    "content_types": {
      "article": 6,
      "tutorial": 2,
      "news": 2
    }
  },
  "processing_time_ms": 8
}
```

#### Cancel Job

**POST** `/api/ai/processing`

Cancel a pending or processing job.

**Request Body:**
```json
{
  "action": "cancel-job",
  "job_id": "job-uuid",
  "user_id": "dev-user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "processing_time_ms": 5
}
```

---

## 📊 Queue Management API

### Endpoint: `/api/ai/processing/queue`

#### Get Queue Status

**GET** `/api/ai/processing/queue?action=status`

Get comprehensive queue status and capacity information.

**Response:**
```json
{
  "success": true,
  "queue_status": {
    "total_jobs": 25,
    "queue_stats": {
      "pending": 5,
      "processing": 2,
      "completed": 15,
      "failed": 2,
      "cancelled": 1,
      "paused": 0
    },
    "priority_queue": {
      "urgent": 1,
      "high": 2,
      "normal": 2,
      "low": 0
    },
    "capacity": {
      "max_concurrent": 5,
      "current_processing": 2,
      "available_slots": 3,
      "queue_utilization": 0.05
    },
    "estimated_wait_times": {
      "urgent": "< 1 minute",
      "high": "< 5 minutes",
      "normal": "< 15 minutes",
      "low": "< 1 hour"
    }
  },
  "config": {
    "max_concurrent_jobs": 5,
    "max_queue_size": 100,
    "auto_scaling_enabled": false
  },
  "processing_time_ms": 8
}
```

#### Get Queue Jobs

**GET** `/api/ai/processing/queue?action=jobs&user_id={user_id}&priority={priority}&status={status}`

Get detailed information about jobs in the queue.

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-uuid",
      "user_id": "dev-user-123",
      "type": "batch",
      "status": "pending",
      "priority": "high",
      "queue_position": 2,
      "estimated_start_time": "2025-07-12T10:15:00Z",
      "progress": {
        "total": 20,
        "processed": 0,
        "failed": 0
      },
      "created_at": "2025-07-12T10:00:00Z",
      "retry_count": 0,
      "worker_id": null,
      "resource_usage": null
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "has_more": false
  },
  "processing_time_ms": 12
}
```

#### Get Queue Metrics

**GET** `/api/ai/processing/queue?action=metrics`

Get performance metrics and analytics for the processing queue.

**Response:**
```json
{
  "success": true,
  "current_metrics": {
    "id": "metrics-uuid",
    "timestamp": "2025-07-12T10:30:00Z",
    "queue_stats": {
      "total_jobs": 25,
      "pending_jobs": 5,
      "processing_jobs": 2,
      "completed_jobs": 15,
      "failed_jobs": 2,
      "cancelled_jobs": 1
    },
    "priority_distribution": {
      "urgent": 1,
      "high": 3,
      "normal": 18,
      "low": 3
    },
    "performance_metrics": {
      "average_processing_time": 35000,
      "average_queue_wait_time": 5000,
      "throughput_per_hour": 12.5,
      "success_rate": 88.2,
      "error_rate": 8.8
    },
    "resource_usage": {
      "cpu_usage_percent": 45.2,
      "memory_usage_mb": 1024,
      "api_calls_per_minute": 25,
      "active_workers": 2
    },
    "bottlenecks": {
      "queue_full": false,
      "high_cpu_usage": false,
      "high_memory_usage": false,
      "api_rate_limited": false,
      "slow_processing": false
    }
  },
  "historical_metrics": [...],
  "processing_time_ms": 15
}
```

#### Manage Jobs

**POST** `/api/ai/processing/queue`

Perform bulk operations on queue jobs.

**Request Body:**
```json
{
  "action": "manage-jobs",
  "operation": "prioritize",
  "job_ids": ["job-uuid-1", "job-uuid-2"],
  "new_priority": "high",
  "reason": "Urgent customer request",
  "user_id": "dev-user-123"
}
```

**Available Operations:**
- `pause`: Pause pending or processing jobs
- `resume`: Resume paused jobs
- `cancel`: Cancel jobs
- `prioritize`: Change job priority
- `reschedule`: Schedule jobs for later execution

**Response:**
```json
{
  "success": true,
  "operation": "prioritize",
  "affected_jobs": 2,
  "failed_operations": 0,
  "errors": [],
  "affected_job_ids": ["job-uuid-1", "job-uuid-2"],
  "message": "prioritize operation completed: 2 successful, 0 failed",
  "processing_time_ms": 18
}
```

#### Update Queue Configuration

**POST** `/api/ai/processing/queue`

Update queue configuration settings.

**Request Body:**
```json
{
  "action": "update-config",
  "config_updates": {
    "max_concurrent_jobs": 8,
    "max_queue_size": 150,
    "priority_weights": {
      "urgent": 5,
      "high": 4,
      "normal": 2,
      "low": 1
    },
    "processing_limits": {
      "single_job_timeout": 600000,
      "batch_job_timeout": 3600000
    }
  }
}
```

---

## 💭 Feedback System API

### Endpoint: `/api/ai/processing/feedback`

#### Submit Feedback

**POST** `/api/ai/processing/feedback`

Submit feedback on AI processing accuracy and quality.

**Request Body:**
```json
{
  "action": "submit-feedback",
  "user_id": "dev-user-123",
  "job_id": "job-uuid",
  "item_id": "item-uuid",
  "feedback_type": "accuracy",
  "rating": 4,
  "category_feedback": {
    "original_category": "Technology",
    "suggested_category": "AI/ML",
    "was_correct": false,
    "confidence_rating": 3
  },
  "tag_feedback": {
    "original_tags": ["AI", "tech", "automation"],
    "correct_tags": ["AI", "automation"],
    "incorrect_tags": ["tech"],
    "missing_tags": ["machine learning", "neural networks"],
    "overall_accuracy": 70
  },
  "summary_feedback": {
    "original_summary": "Article about AI developments...",
    "accuracy_rating": 4,
    "completeness_rating": 3,
    "clarity_rating": 5,
    "suggested_improvements": "Include more technical details"
  },
  "quality_score_feedback": {
    "original_score": 85,
    "user_score": 78,
    "reasoning": "Content quality is good but could be more comprehensive"
  },
  "content_type_feedback": {
    "original_type": "article",
    "correct_type": "tutorial",
    "was_correct": false
  },
  "duplicate_detection_feedback": {
    "original_status": "unique",
    "correct_status": "similar",
    "was_correct": false,
    "missed_duplicates": ["bookmark-id-123"]
  },
  "comments": "Overall good analysis but category could be more specific"
}
```

**Response:**
```json
{
  "success": true,
  "feedback_id": "feedback-uuid",
  "message": "Feedback submitted successfully",
  "processing_time_ms": 12
}
```

#### Get Feedback Analytics

**GET** `/api/ai/processing/feedback?action=analytics&time_period={days}`

Get comprehensive analytics on AI processing accuracy.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "overall_satisfaction": 78.5,
    "category_accuracy": 85.2,
    "tag_accuracy": 72.8,
    "summary_quality": 81.3,
    "content_type_accuracy": 89.1,
    "duplicate_detection_accuracy": 76.4,
    "total_feedback_count": 1250,
    "recent_feedback_count": 89,
    "improvement_suggestions": [
      "Improve tag generation algorithms",
      "Enhance category classification accuracy",
      "Better handling of technical content"
    ],
    "critical_issues": [
      "Tag generation accuracy significantly below expectations"
    ],
    "user_engagement": {
      "active_feedback_users": 45,
      "average_feedback_per_user": 2.8,
      "feedback_frequency": "3.2 per day"
    }
  },
  "time_period_days": 30,
  "processing_time_ms": 25
}
```

#### Bulk Feedback Submission

**POST** `/api/ai/processing/feedback`

Submit multiple feedback items in a single request.

**Request Body:**
```json
{
  "action": "bulk-feedback",
  "user_id": "dev-user-123",
  "feedback_items": [
    {
      "job_id": "job-uuid-1",
      "item_id": "item-uuid-1",
      "feedback_type": "accuracy",
      "rating": 4,
      "category_feedback": {
        "original_category": "Technology",
        "suggested_category": "AI/ML",
        "was_correct": false,
        "confidence_rating": 3
      }
    },
    {
      "job_id": "job-uuid-2",
      "item_id": "item-uuid-2",
      "feedback_type": "relevance",
      "rating": 5,
      "tag_feedback": {
        "original_tags": ["programming", "tutorial"],
        "correct_tags": ["programming", "tutorial"],
        "incorrect_tags": [],
        "missing_tags": [],
        "overall_accuracy": 100
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "submitted": 2,
  "failed": 0,
  "errors": [],
  "feedback_ids": ["feedback-uuid-1", "feedback-uuid-2"],
  "message": "Bulk feedback submitted: 2 successful, 0 failed",
  "processing_time_ms": 28
}
```

---

## 🔧 Processing Settings

### Available Processing Options

#### Content Analysis Settings
```json
{
  "auto_categorize": true,           // Enable AI categorization
  "auto_tag": true,                  // Enable AI tag generation
  "extract_content": true,           // Extract content from URLs
  "generate_summary": true,          // Generate AI summaries
  "detect_language": true,           // Detect content language
  "quality_score": true,             // Calculate quality scores
  "duplicate_detection": true,       // Check for duplicates
  "sentiment_analysis": false,       // Analyze sentiment
  "keyword_extraction": true,        // Extract keywords
  "content_enhancement": false       // Enhance existing content
}
```

#### Quality Control Settings
```json
{
  "confidence_threshold": 0.5,       // Minimum confidence for results
  "max_tags": 8,                     // Maximum tags per item
  "max_summary_length": 300,         // Maximum summary characters
  "language_preference": "en"        // Preferred language
}
```

#### Custom AI Prompts
```json
{
  "custom_prompts": {
    "categorization": "Custom prompt for categorization...",
    "tagging": "Custom prompt for tag generation...",
    "summary": "Custom prompt for summarization..."
  }
}
```

---

## 📈 Performance & Monitoring

### Queue Performance Metrics

- **Throughput**: Jobs processed per hour
- **Latency**: Average processing time per job
- **Success Rate**: Percentage of successful completions
- **Queue Depth**: Number of pending jobs
- **Resource Usage**: CPU, memory, and API usage

### AI Accuracy Metrics

- **Category Accuracy**: Percentage of correct categorizations
- **Tag Relevance**: Quality score for generated tags
- **Summary Quality**: User satisfaction with summaries
- **Duplicate Detection**: Accuracy of duplicate identification
- **Overall Satisfaction**: Combined user rating

### Feedback Analytics

- **User Engagement**: Active feedback users and frequency
- **Improvement Areas**: Common issues and suggestions
- **Critical Issues**: High-priority problems requiring attention
- **Trend Analysis**: Performance improvements over time

---

## 🚨 Error Handling

### Common Error Responses

```json
{
  "success": false,
  "error": "Invalid job configuration",
  "details": "max_items_per_batch exceeded",
  "processing_time_ms": 5
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized
- `403`: Forbidden (access denied)
- `404`: Not Found (job/resource not found)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## 🔄 Integration Examples

### JavaScript/TypeScript

```typescript
// Create processing job
const createProcessingJob = async (items, settings) => {
  const response = await fetch('/api/ai/processing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-job',
      items,
      settings,
      priority: 'normal'
    })
  });
  return response.json();
};

// Monitor job progress
const monitorJob = async (jobId) => {
  const response = await fetch(`/api/ai/processing?action=status&job_id=${jobId}`);
  return response.json();
};

// Submit feedback
const submitFeedback = async (jobId, feedback) => {
  const response = await fetch('/api/ai/processing/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submit-feedback',
      job_id: jobId,
      ...feedback
    })
  });
  return response.json();
};

// Get queue status
const getQueueStatus = async () => {
  const response = await fetch('/api/ai/processing/queue?action=status');
  return response.json();
};
```

### Python

```python
import requests

class AIProcessingClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def create_job(self, items, settings, priority='normal'):
        response = requests.post(f'{self.base_url}/api/ai/processing', json={
            'action': 'create-job',
            'items': items,
            'settings': settings,
            'priority': priority
        })
        return response.json()
    
    def get_job_status(self, job_id):
        response = requests.get(f'{self.base_url}/api/ai/processing', params={
            'action': 'status',
            'job_id': job_id
        })
        return response.json()
    
    def submit_feedback(self, job_id, feedback_data):
        response = requests.post(f'{self.base_url}/api/ai/processing/feedback', json={
            'action': 'submit-feedback',
            'job_id': job_id,
            **feedback_data
        })
        return response.json()
```

---

## 🔐 Security & Rate Limiting

### Authentication
- All endpoints require valid user authentication
- User-scoped access control for jobs and feedback
- API key authentication for service-to-service calls

### Rate Limiting
- 100 requests per minute per user for job creation
- 500 requests per minute for status checks
- 50 feedback submissions per minute per user

### Data Privacy
- Processing results are user-scoped and private
- Feedback data is anonymized for analytics
- Automatic cleanup of old job data

---

## 📊 Monitoring & Alerts

### System Monitoring
- Queue depth and processing capacity
- API response times and error rates
- Resource usage (CPU, memory, API calls)
- AI model performance and accuracy

### Alerting
- Queue overflow warnings
- High error rate alerts
- Performance degradation notifications
- Critical feedback issue alerts

This comprehensive AI Processing API system provides enterprise-level capabilities for automated bookmark analysis, intelligent queue management, and continuous improvement through user feedback. 