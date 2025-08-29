#!/usr/bin/env node

/**
 * Test script for AI Recommendations API
 * 
 * This script tests the AI recommendations API endpoint with various settings
 * to ensure it's working correctly.
 */

const BASE_URL = 'http://localhost:3000'

// Test settings configurations
const testConfigs = [
  {
    name: 'Basic Configuration',
    settings: {
      suggestionsPerRefresh: 3,
      serendipityLevel: 5,
      autoIncludeOnSelect: true,
      autoBundle: false,
      includeTLDR: true,
      domainBlacklist: [],
      revisitNudgeDays: 14,
      includeTrending: false
    }
  },
  {
    name: 'High Serendipity',
    settings: {
      suggestionsPerRefresh: 5,
      serendipityLevel: 9,
      autoIncludeOnSelect: false,
      autoBundle: true,
      includeTLDR: false,
      domainBlacklist: ['example.com'],
      revisitNudgeDays: 7,
      includeTrending: true
    }
  },
  {
    name: 'Focused Recommendations',
    settings: {
      suggestionsPerRefresh: 2,
      serendipityLevel: 1,
      autoIncludeOnSelect: true,
      autoBundle: false,
      includeTLDR: true,
      domainBlacklist: ['reddit.com', 'twitter.com'],
      revisitNudgeDays: 30,
      includeTrending: false
    }
  }
]

async function testRecommendationsAPI() {
  console.log('🧪 Testing AI Recommendations API Integration\n')
  
  // Test GET endpoint first
  console.log('📡 Testing GET /api/ai/recommendations...')
  try {
    const response = await fetch(`${BASE_URL}/api/ai/recommendations`)
    const data = await response.json()
    console.log('✅ GET endpoint working:', data.service, data.version)
  } catch (error) {
    console.error('❌ GET endpoint failed:', error.message)
    return
  }
  
  console.log('\n🔄 Testing POST endpoint with different configurations...\n')
  
  // Test each configuration
  for (const config of testConfigs) {
    console.log(`🎯 Testing: ${config.name}`)
    console.log('Settings:', JSON.stringify(config.settings, null, 2))
    
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: config.settings })
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ HTTP ${response.status}:`, errorData.error || response.statusText)
        continue
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Success! Generated ${data.recommendations.length} recommendations in ${duration}ms`)
        console.log('📊 API Response:', {
          totalGenerated: data.totalGenerated,
          totalFiltered: data.totalFiltered,
          model: data.model,
          usage: data.usage
        })
        
        // Log first recommendation as example
        if (data.recommendations.length > 0) {
          const firstRec = data.recommendations[0]
          console.log('📖 Example recommendation:', {
            title: firstRec.title,
            confidence: firstRec.confidence,
            readTime: firstRec.readTime,
            whyCount: firstRec.why.length
          })
        }
      } else {
        console.error('❌ API returned error:', data.error)
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('🏁 API Integration Test Complete!')
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRecommendationsAPI().catch(console.error)
}

module.exports = { testRecommendationsAPI } 