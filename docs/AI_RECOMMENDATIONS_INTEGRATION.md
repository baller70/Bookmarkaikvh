# AI Recommendations API Integration

## Overview

This document describes the integration of real AI-powered recommendations into the KH Jinx bookmark management system. The implementation replaces mock data with actual OpenAI-powered recommendations based on user preferences and browsing history.

## Architecture

### API Endpoint
- **Location**: `app/api/ai/recommendations/route.ts`
- **Method**: POST
- **Authentication**: Supabase user authentication required
- **Rate Limiting**: Handled by OpenAI API limits

### Frontend Integration
- **Location**: `app/settings/ai/recommendations/page.tsx`
- **Hook**: `useRecAPI()` - handles API calls with fallback to mock data
- **Error Handling**: Graceful degradation to fallback recommendations

## Features Implemented

### 1. Real AI Recommendations
- **OpenAI Integration**: Uses GPT-4 Turbo for generating personalized recommendations
- **User Context**: Analyzes user's recent bookmarks, categories, and interests
- **Customizable Parameters**: 
  - Suggestions per refresh (1-10)
  - Serendipity level (0-10) - controls exploration vs exploitation
  - Domain blacklist filtering
  - Trending content inclusion
  - TL;DR summaries

### 2. Intelligent Prompt Engineering
- **Dynamic Prompts**: Adjusts based on user settings and serendipity level
- **Context Awareness**: Incorporates user's browsing patterns and preferences
- **Quality Control**: Validates response structure and content quality

### 3. Error Handling & Fallbacks
- **Graceful Degradation**: Falls back to mock data if API fails
- **User Experience**: Maintains functionality even during API outages
- **Logging**: Comprehensive error logging with Sentry integration

### 4. Performance Optimizations
- **Caching**: Response caching for improved performance
- **Streaming**: Efficient handling of large recommendation sets
- **Timeout Management**: Prevents hanging requests

## Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Testing Mode
AI_RECOMMENDATIONS_TESTING=true  # Uses mock data instead of OpenAI
```

### User Settings
Users can configure their recommendation preferences through the settings page:

1. **Engine Settings**
   - Number of suggestions per refresh
   - Serendipity level (focus ↔ explore)
   - Include trending content

2. **Automation**
   - Auto-include selected recommendations
   - Auto-bundle into collections

3. **Content Filtering**
   - Domain blacklist
   - TL;DR summary inclusion

4. **Revisit Nudges**
   - Days between revisit suggestions

## API Request/Response Format

### Request
```json
{
  "settings": {
    "suggestionsPerRefresh": 5,
    "serendipityLevel": 7,
    "autoIncludeOnSelect": true,
    "autoBundle": false,
    "includeTLDR": true,
    "domainBlacklist": ["example.com"],
    "revisitNudgeDays": 14,
    "includeTrending": true
  }
}
```

### Response
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "unique-id",
      "url": "https://example.com/article",
      "title": "Article Title",
      "description": "Brief description",
      "favicon": "🔗",
      "readTime": "≈5 min read",
      "confidence": 0.87,
      "why": ["Reason 1", "Reason 2", "Reason 3"]
    }
  ],
  "totalGenerated": 5,
  "totalFiltered": 0,
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  },
  "model": "gpt-4-turbo-preview",
  "timestamp": 1704067200000
}
```

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Navigate to `/settings/ai/recommendations`
3. Configure your preferences
4. Click "Generate Recommendations"
5. Verify AI-generated content appears

### Automated Testing
```bash
# Run the API integration test
node scripts/test-ai-recommendations.js
```

### Testing Mode
Set `AI_RECOMMENDATIONS_TESTING=true` to use mock data instead of OpenAI API calls during development.

## Error Scenarios

### 1. OpenAI API Unavailable
- **Fallback**: Returns mock recommendations
- **User Experience**: Seamless operation with notice in console
- **Logging**: Error logged to Sentry

### 2. Rate Limit Exceeded
- **Response**: 429 status with retry-after header
- **User Experience**: Clear error message with retry suggestion
- **Logging**: Rate limit events tracked

### 3. Invalid API Key
- **Response**: 401 authentication error
- **User Experience**: Admin notification required
- **Logging**: Configuration error logged

### 4. Malformed Response
- **Fallback**: JSON parsing error handling
- **User Experience**: Falls back to mock data
- **Logging**: Response structure logged for debugging

## Future Enhancements

### 1. User Context Enhancement
- **Bookmark Analysis**: Deeper analysis of user's bookmark content
- **Behavioral Patterns**: Time-based recommendation optimization
- **Social Signals**: Incorporate network effects

### 2. Recommendation Quality
- **Feedback Loop**: User feedback integration for model improvement
- **A/B Testing**: Test different prompt strategies
- **Personalization**: More sophisticated user profiling

### 3. Performance Optimizations
- **Caching**: Implement Redis caching for frequent requests
- **Batch Processing**: Handle multiple users efficiently
- **CDN Integration**: Optimize content delivery

### 4. Analytics & Insights
- **Usage Metrics**: Track recommendation engagement
- **Quality Metrics**: Monitor recommendation relevance
- **User Satisfaction**: Feedback collection and analysis

## Security Considerations

### 1. API Key Management
- **Environment Variables**: Secure storage of OpenAI API keys
- **Rotation**: Regular API key rotation procedures
- **Access Control**: Restricted access to production keys

### 2. User Data Privacy
- **Data Minimization**: Only send necessary user context
- **Anonymization**: Remove personally identifiable information
- **Compliance**: GDPR and privacy regulation compliance

### 3. Rate Limiting
- **User Limits**: Prevent abuse of recommendation generation
- **API Limits**: Respect OpenAI usage limits
- **Cost Control**: Monitor and alert on usage costs

## Monitoring & Observability

### 1. Metrics
- **API Response Times**: Track recommendation generation speed
- **Success Rates**: Monitor API success/failure rates
- **User Engagement**: Track recommendation click-through rates

### 2. Logging
- **Request Logging**: All API requests logged with user context
- **Error Logging**: Comprehensive error tracking with Sentry
- **Performance Logging**: Response times and resource usage

### 3. Alerts
- **API Failures**: Alert on consecutive API failures
- **Rate Limits**: Alert on approaching rate limits
- **Cost Thresholds**: Alert on usage cost thresholds

## Deployment Checklist

- [ ] Set `OPENAI_API_KEY` in production environment
- [ ] Configure Sentry for error tracking
- [ ] Set up monitoring and alerting
- [ ] Test API endpoints in production
- [ ] Verify fallback mechanisms work
- [ ] Configure rate limiting
- [ ] Set up cost monitoring
- [ ] Document operational procedures

## Conclusion

The AI Recommendations integration provides a robust, scalable solution for personalized content discovery. The implementation prioritizes user experience with graceful error handling and fallback mechanisms while providing powerful AI-driven recommendations when available.

The system is designed to be maintainable, observable, and secure, with comprehensive testing and monitoring capabilities built in from the start. 