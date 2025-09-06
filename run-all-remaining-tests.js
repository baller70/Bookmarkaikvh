#!/usr/bin/env node

/**
 * Comprehensive Test Runner for All Remaining BookmarkHub Tests
 * Executes all test scripts and provides consolidated reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.testScripts = [
      {
        name: 'AI LinkPilot Content Discovery',
        script: 'test-ai-linkpilot-content-discovery.js',
        description: 'Tests Content Discovery page functionality'
      },
      {
        name: 'AI LinkPilot Auto-Processing',
        script: 'test-ai-linkpilot-auto-processing.js',
        description: 'Tests Auto-Processing Settings page'
      },
      {
        name: 'AI LinkPilot Bulk Uploader',
        script: 'test-ai-linkpilot-bulk-uploader.js',
        description: 'Tests Magic Bulk Link Uploader page'
      },
      {
        name: 'AI LinkPilot Link Validator',
        script: 'test-ai-linkpilot-validator.js',
        description: 'Tests Link Validator Dashboard'
      },
      {
        name: 'AI LinkPilot Comprehensive',
        script: 'test-ai-linkpilot-comprehensive.js',
        description: 'Cross-browser, performance, accessibility, and security testing'
      },
      {
        name: 'Settings Appearance',
        script: 'test-settings-appearance.js',
        description: 'Tests Appearance Settings section'
      },
      {
        name: 'Settings Backup & Export',
        script: 'test-settings-backup-export.js',
        description: 'Tests Backup & Export Settings section'
      }
    ];
    
    this.results = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      scriptResults: [],
      startTime: null,
      endTime: null
    };
  }

  async runScript(scriptInfo) {
    return new Promise((resolve) => {
      console.log(`\n🚀 Running ${scriptInfo.name}...`);
      console.log(`📝 ${scriptInfo.description}`);
      console.log('─'.repeat(60));
      
      const startTime = Date.now();
      const child = spawn('node', [scriptInfo.script], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });
      
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });
      
      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Parse results from stdout
        const testResults = this.parseTestResults(stdout);
        
        const result = {
          name: scriptInfo.name,
          script: scriptInfo.script,
          description: scriptInfo.description,
          exitCode: code,
          duration: duration,
          passed: testResults.passed,
          failed: testResults.failed,
          total: testResults.total,
          successRate: testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0,
          stdout: stdout,
          stderr: stderr
        };
        
        this.results.scriptResults.push(result);
        this.results.totalTests += testResults.total;
        this.results.totalPassed += testResults.passed;
        this.results.totalFailed += testResults.failed;
        
        console.log(`\n✅ ${scriptInfo.name} completed in ${(duration / 1000).toFixed(2)}s`);
        console.log(`📊 Results: ${testResults.passed}/${testResults.total} passed (${result.successRate}%)`);
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        console.error(`❌ Failed to run ${scriptInfo.name}: ${error.message}`);
        
        const result = {
          name: scriptInfo.name,
          script: scriptInfo.script,
          description: scriptInfo.description,
          exitCode: -1,
          duration: Date.now() - startTime,
          passed: 0,
          failed: 1,
          total: 1,
          successRate: 0,
          stdout: '',
          stderr: error.message
        };
        
        this.results.scriptResults.push(result);
        this.results.totalFailed += 1;
        this.results.totalTests += 1;
        
        resolve(result);
      });
    });
  }

  parseTestResults(stdout) {
    const results = { passed: 0, failed: 0, total: 0 };
    
    // Look for test result patterns
    const passedMatch = stdout.match(/Passed:\s*(\d+)/i);
    const failedMatch = stdout.match(/Failed:\s*(\d+)/i);
    const totalMatch = stdout.match(/Total Tests?:\s*(\d+)/i);
    
    if (passedMatch) results.passed = parseInt(passedMatch[1]);
    if (failedMatch) results.failed = parseInt(failedMatch[1]);
    if (totalMatch) results.total = parseInt(totalMatch[1]);
    
    // If total not found, calculate from passed + failed
    if (results.total === 0 && (results.passed > 0 || results.failed > 0)) {
      results.total = results.passed + results.failed;
    }
    
    return results;
  }

  async runAllTests() {
    console.log('🎯 BookmarkHub Comprehensive Test Suite');
    console.log('='.repeat(80));
    console.log(`📋 Running ${this.testScripts.length} test scripts...`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    
    this.results.startTime = Date.now();
    
    // Check if test scripts exist
    const missingScripts = [];
    for (const script of this.testScripts) {
      if (!fs.existsSync(script.script)) {
        missingScripts.push(script.script);
      }
    }
    
    if (missingScripts.length > 0) {
      console.log('\n⚠️  Warning: The following test scripts were not found:');
      missingScripts.forEach(script => console.log(`   • ${script}`));
      console.log('\n   These tests will be skipped.\n');
    }
    
    // Run each test script
    for (const scriptInfo of this.testScripts) {
      if (fs.existsSync(scriptInfo.script)) {
        await this.runScript(scriptInfo);
      } else {
        console.log(`\n⏭️  Skipping ${scriptInfo.name} (script not found)`);
        
        const result = {
          name: scriptInfo.name,
          script: scriptInfo.script,
          description: scriptInfo.description,
          exitCode: -1,
          duration: 0,
          passed: 0,
          failed: 1,
          total: 1,
          successRate: 0,
          stdout: '',
          stderr: 'Script file not found'
        };
        
        this.results.scriptResults.push(result);
        this.results.totalFailed += 1;
        this.results.totalTests += 1;
      }
    }
    
    this.results.endTime = Date.now();
    
    // Generate comprehensive report
    this.generateFinalReport();
  }

  generateFinalReport() {
    const totalDuration = this.results.endTime - this.results.startTime;
    const overallSuccessRate = this.results.totalTests > 0 ? 
      ((this.results.totalPassed / this.results.totalTests) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 COMPREHENSIVE TEST SUITE COMPLETED');
    console.log('='.repeat(80));
    
    console.log('\n📊 OVERALL RESULTS:');
    console.log(`   Total Test Scripts: ${this.testScripts.length}`);
    console.log(`   Total Individual Tests: ${this.results.totalTests}`);
    console.log(`   Passed: ${this.results.totalPassed} ✅`);
    console.log(`   Failed: ${this.results.totalFailed} ❌`);
    console.log(`   Success Rate: ${overallSuccessRate}%`);
    console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);
    
    console.log('\n📋 SCRIPT-BY-SCRIPT BREAKDOWN:');
    this.results.scriptResults.forEach((result, index) => {
      const status = result.exitCode === 0 ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      
      console.log(`\n${index + 1}. ${status} ${result.name}`);
      console.log(`   📝 ${result.description}`);
      console.log(`   📊 Results: ${result.passed}/${result.total} passed (${result.successRate}%)`);
      console.log(`   ⏱️  Duration: ${duration}s`);
      
      if (result.exitCode !== 0) {
        console.log(`   ❌ Exit Code: ${result.exitCode}`);
        if (result.stderr) {
          console.log(`   🔍 Error: ${result.stderr.split('\n')[0]}`);
        }
      }
    });
    
    // Performance summary
    console.log('\n⚡ PERFORMANCE SUMMARY:');
    const sortedByDuration = [...this.results.scriptResults].sort((a, b) => b.duration - a.duration);
    console.log('   Slowest Tests:');
    sortedByDuration.slice(0, 3).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name}: ${(result.duration / 1000).toFixed(2)}s`);
    });
    
    // Success rate summary
    console.log('\n🎯 SUCCESS RATE SUMMARY:');
    const sortedBySuccess = [...this.results.scriptResults].sort((a, b) => b.successRate - a.successRate);
    sortedBySuccess.forEach((result) => {
      const icon = result.successRate >= 90 ? '🟢' : result.successRate >= 70 ? '🟡' : '🔴';
      console.log(`   ${icon} ${result.name}: ${result.successRate}%`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    const failedScripts = this.results.scriptResults.filter(r => r.exitCode !== 0);
    const lowSuccessScripts = this.results.scriptResults.filter(r => r.successRate < 80);
    
    if (failedScripts.length === 0 && lowSuccessScripts.length === 0) {
      console.log('   🎉 Excellent! All tests are passing with high success rates.');
      console.log('   ✅ The application is ready for deployment to Vercel.');
    } else {
      if (failedScripts.length > 0) {
        console.log(`   🔧 ${failedScripts.length} test script(s) failed to run - check for missing dependencies or setup issues.`);
      }
      if (lowSuccessScripts.length > 0) {
        console.log(`   📈 ${lowSuccessScripts.length} test script(s) have success rates below 80% - review and fix failing tests.`);
      }
      console.log('   🚀 Address these issues before deploying to production.');
    }
    
    // Generate summary file
    this.generateSummaryFile();
    
    console.log('\n📄 Detailed test report saved to: test-results-summary.json');
    console.log('🏁 Test suite execution completed!');
    
    // Exit with appropriate code
    process.exit(failedScripts.length > 0 ? 1 : 0);
  }

  generateSummaryFile() {
    const summary = {
      timestamp: new Date().toISOString(),
      duration: this.results.endTime - this.results.startTime,
      overall: {
        totalScripts: this.testScripts.length,
        totalTests: this.results.totalTests,
        totalPassed: this.results.totalPassed,
        totalFailed: this.results.totalFailed,
        successRate: this.results.totalTests > 0 ? 
          ((this.results.totalPassed / this.results.totalTests) * 100).toFixed(1) : 0
      },
      scripts: this.results.scriptResults.map(result => ({
        name: result.name,
        script: result.script,
        description: result.description,
        exitCode: result.exitCode,
        duration: result.duration,
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: result.successRate,
        hasErrors: result.exitCode !== 0
      }))
    };
    
    try {
      fs.writeFileSync('test-results-summary.json', JSON.stringify(summary, null, 2));
    } catch (error) {
      console.warn(`Warning: Could not save summary file: ${error.message}`);
    }
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveTestRunner;
