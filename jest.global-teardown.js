// Jest global teardown - runs once after all tests
module.exports = async () => {
  console.log('🧹 Cleaning up test environment...')
  
  // Clean up test data
  const fs = require('fs')
  const path = require('path')
  
  const testDataDir = path.join(__dirname, 'test-data')
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  }
  
  // Clean up any temporary files
  const tempFiles = [
    'coverage',
    '.nyc_output',
    'test-results.xml',
    'junit.xml',
  ]
  
  tempFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true })
    }
  })
  
  console.log('✅ Test environment cleaned up')
} 