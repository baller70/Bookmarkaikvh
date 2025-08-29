const fetch = require('node-fetch');

async function testBulkUploader() {
    console.log('🧪 Testing Bulk Uploader with corrected table names...');
    
    const testData = {
        links: [
            'https://github.com/vercel/next.js',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'https://docs.supabase.com/guides/database'
        ],
        settings: {
            batchSize: 10,
            privacy: 'private',
            autoCategorize: true,
            duplicateHandling: 'autoMerge',
            extraTag: 'test-batch'
        }
    };
    
    try {
        console.log('📡 Sending request to bulk uploader API...');
        
        const response = await fetch('http://localhost:3000/api/ai/bulk-uploader', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('📊 Response status:', response.status);
        console.log('📋 Response data:', JSON.stringify(result, null, 2));
        
        if (response.ok && result.success) {
            console.log('✅ Bulk uploader test PASSED!');
            console.log(`📈 Processed: ${result.totalProcessed || 0} links`);
            console.log(`✅ Successful: ${result.totalSuccessful || 0} links`);
            console.log(`❌ Failed: ${result.totalFailed || 0} links`);
        } else {
            console.log('❌ Bulk uploader test FAILED!');
            console.log('Error:', result.error || 'Unknown error');
            if (result.errors) {
                console.log('Detailed errors:', result.errors);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed with exception:', error.message);
    }
}

// Run the test
testBulkUploader(); 