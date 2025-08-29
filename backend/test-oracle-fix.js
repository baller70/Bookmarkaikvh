// Test script to verify Oracle component error is fixed
console.log('🔍 Testing Oracle component fix...')

// Test 1: Check if the component file exists and has proper structure
const fs = require('fs')
const path = require('path')

try {
  const oracleFile = path.join(__dirname, 'components/oracle/oracle-blob.tsx')
  const content = fs.readFileSync(oracleFile, 'utf8')
  
  console.log('✅ Oracle component file exists')
  
  // Check if startWakeWordListening is properly defined
  const startWakeWordMatches = content.match(/startWakeWordListening/g)
  console.log(`📊 Found ${startWakeWordMatches?.length || 0} references to startWakeWordListening`)
  
  // Check if the function is defined before it's called
  const functionDefIndex = content.indexOf('const startWakeWordListening = async ()')
  const useEffectCallIndex = content.indexOf('startWakeWordListening()')
  
  if (functionDefIndex > -1 && useEffectCallIndex > -1) {
    if (functionDefIndex < useEffectCallIndex) {
      console.log('✅ startWakeWordListening function is defined before it\'s called')
    } else {
      console.log('❌ startWakeWordListening function is called before it\'s defined')
      console.log(`Function definition at index: ${functionDefIndex}`)
      console.log(`First call at index: ${useEffectCallIndex}`)
    }
  } else {
    console.log('⚠️ Could not find function definition or call')
  }
  
  // Check for duplicate function definitions
  const duplicateCheck = content.match(/const handleQuickAction = \(prompt: string\) => {/g)
  if (duplicateCheck && duplicateCheck.length > 1) {
    console.log(`❌ Found ${duplicateCheck.length} duplicate handleQuickAction definitions`)
  } else {
    console.log('✅ No duplicate function definitions found')
  }
  
  console.log('🎉 Oracle component structure check completed')
  
} catch (error) {
  console.error('❌ Error checking Oracle component:', error.message)
}

// Test 2: Check if the API endpoints are working
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/playbooks?user_id=test-user-123')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API endpoints are working')
      console.log(`📊 API returned ${data.total} playbooks`)
    } else {
      console.log('❌ API endpoints not responding')
    }
  } catch (error) {
    console.log('⚠️ Could not test API (server might not be running)')
  }
}

testAPI() 