#!/usr/bin/env node

/**
 * BookmarkHub Deployment Readiness Verification Script
 * Comprehensive check to ensure all tasks are complete and app is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

class DeploymentReadinessChecker {
  constructor() {
    this.checks = {
      taskCompletion: false,
      testScripts: false,
      codeQuality: false,
      configuration: false,
      documentation: false
    };
    
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(level, message, details = null) {
    const timestamp = new Date().toLocaleTimeString();
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    
    console.log(`${icons[level]} [${timestamp}] ${message}`);
    if (details) {
      console.log(`   ${details}`);
    }
    
    this.results.details.push({ level, message, details, timestamp });
    
    if (level === 'success') this.results.passed++;
    else if (level === 'error') this.results.failed++;
    else if (level === 'warning') this.results.warnings++;
  }

  async checkTaskCompletion() {
    this.log('info', 'Checking task completion status...');
    
    try {
      // Check if all major features are implemented
      const criticalFiles = [
        'apps/web/app/api/bookmarks/route.ts',
        'apps/web/app/api/bookmarks/upload/route.ts',
        'apps/web/app/dashboard/page.tsx',
        'apps/web/app/settings/page.tsx',
        'apps/web/components/ui/bookmark-card.tsx'
      ];
      
      let missingFiles = 0;
      for (const file of criticalFiles) {
        if (!fs.existsSync(file)) {
          this.log('warning', `Critical file missing: ${file}`);
          missingFiles++;
        }
      }
      
      if (missingFiles === 0) {
        this.log('success', 'All critical application files are present');
        this.checks.taskCompletion = true;
      } else {
        this.log('error', `${missingFiles} critical files are missing`);
      }
      
      // Check for key functionality implementations
      const keyFeatures = [
        { name: 'Favicon Extraction', pattern: /favicon|icon/i },
        { name: 'Search Functionality', pattern: /search|filter/i },
        { name: 'Category Management', pattern: /categor/i },
        { name: 'Favorite System', pattern: /favorite|heart/i },
        { name: 'Data Persistence', pattern: /supabase|database/i }
      ];
      
      let implementedFeatures = 0;
      for (const feature of keyFeatures) {
        // Simple check - in production, this would be more sophisticated
        const hasFeature = criticalFiles.some(file => {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            return feature.pattern.test(content);
          }
          return false;
        });
        
        if (hasFeature) {
          implementedFeatures++;
          this.log('success', `${feature.name} implementation detected`);
        } else {
          this.log('warning', `${feature.name} implementation not clearly detected`);
        }
      }
      
      this.log('info', `Feature implementation check: ${implementedFeatures}/${keyFeatures.length} features detected`);
      
    } catch (error) {
      this.log('error', 'Failed to check task completion', error.message);
    }
  }

  async checkTestScripts() {
    this.log('info', 'Checking test script availability...');
    
    const expectedTestScripts = [
      'test-ai-linkpilot-content-discovery.js',
      'test-ai-linkpilot-auto-processing.js',
      'test-ai-linkpilot-bulk-uploader.js',
      'test-ai-linkpilot-validator.js',
      'test-ai-linkpilot-comprehensive.js',
      'test-settings-appearance.js',
      'test-settings-backup-export.js',
      'run-all-remaining-tests.js',
      'run-all-tests.js'
    ];
    
    let foundScripts = 0;
    let missingScripts = [];
    
    for (const script of expectedTestScripts) {
      if (fs.existsSync(script)) {
        foundScripts++;
        this.log('success', `Test script found: ${script}`);
      } else {
        missingScripts.push(script);
        this.log('warning', `Test script missing: ${script}`);
      }
    }
    
    if (foundScripts >= expectedTestScripts.length * 0.8) {
      this.log('success', `Test coverage: ${foundScripts}/${expectedTestScripts.length} scripts available`);
      this.checks.testScripts = true;
    } else {
      this.log('error', `Insufficient test coverage: ${foundScripts}/${expectedTestScripts.length} scripts`);
    }
    
    // Check if test runner exists
    if (fs.existsSync('run-all-remaining-tests.js')) {
      this.log('success', 'Comprehensive test runner is available');
    } else {
      this.log('warning', 'Comprehensive test runner not found');
    }
  }

  async checkCodeQuality() {
    this.log('info', 'Checking code quality indicators...');
    
    try {
      // Check package.json for proper configuration
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.build) {
          this.log('success', 'Build script configured in package.json');
        } else {
          this.log('warning', 'Build script not found in package.json');
        }
        
        if (packageJson.scripts && packageJson.scripts.start) {
          this.log('success', 'Start script configured in package.json');
        } else {
          this.log('warning', 'Start script not found in package.json');
        }
        
        // Check for essential dependencies
        const essentialDeps = ['next', 'react', 'typescript'];
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        let foundDeps = 0;
        for (const dep of essentialDeps) {
          if (deps[dep]) {
            foundDeps++;
          }
        }
        
        if (foundDeps === essentialDeps.length) {
          this.log('success', 'All essential dependencies are present');
          this.checks.codeQuality = true;
        } else {
          this.log('warning', `Missing essential dependencies: ${essentialDeps.length - foundDeps}`);
        }
        
      } else {
        this.log('error', 'package.json not found');
      }
      
      // Check TypeScript configuration
      if (fs.existsSync('tsconfig.json')) {
        this.log('success', 'TypeScript configuration found');
      } else {
        this.log('warning', 'TypeScript configuration not found');
      }
      
      // Check Next.js configuration
      if (fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs')) {
        this.log('success', 'Next.js configuration found');
      } else {
        this.log('warning', 'Next.js configuration not found');
      }
      
    } catch (error) {
      this.log('error', 'Failed to check code quality', error.message);
    }
  }

  async checkConfiguration() {
    this.log('info', 'Checking deployment configuration...');
    
    try {
      // Check for environment configuration
      const envFiles = ['.env', '.env.local', '.env.example'];
      let foundEnvFiles = 0;
      
      for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
          foundEnvFiles++;
          this.log('success', `Environment file found: ${envFile}`);
        }
      }
      
      if (foundEnvFiles > 0) {
        this.log('success', 'Environment configuration files are present');
      } else {
        this.log('warning', 'No environment configuration files found');
      }
      
      // Check for Vercel configuration
      if (fs.existsSync('vercel.json')) {
        this.log('success', 'Vercel configuration found');
        this.checks.configuration = true;
      } else {
        this.log('info', 'Vercel configuration not found (optional for Next.js apps)');
        this.checks.configuration = true; // Not required for Next.js
      }
      
      // Check for deployment script
      if (fs.existsSync('deploy-to-vercel.sh')) {
        this.log('success', 'Deployment script found');
      } else {
        this.log('warning', 'Deployment script not found');
      }
      
    } catch (error) {
      this.log('error', 'Failed to check configuration', error.message);
    }
  }

  async checkDocumentation() {
    this.log('info', 'Checking documentation completeness...');
    
    try {
      const docFiles = [
        'README.md',
        'DEPLOYMENT_SUMMARY.md',
        'test-results-summary.json'
      ];
      
      let foundDocs = 0;
      for (const docFile of docFiles) {
        if (fs.existsSync(docFile)) {
          foundDocs++;
          this.log('success', `Documentation found: ${docFile}`);
        } else {
          this.log('warning', `Documentation missing: ${docFile}`);
        }
      }
      
      if (foundDocs >= 2) {
        this.log('success', 'Adequate documentation is available');
        this.checks.documentation = true;
      } else {
        this.log('warning', 'Insufficient documentation');
      }
      
    } catch (error) {
      this.log('error', 'Failed to check documentation', error.message);
    }
  }

  async generateReadinessReport() {
    const totalChecks = Object.keys(this.checks).length;
    const passedChecks = Object.values(this.checks).filter(Boolean).length;
    const readinessScore = (passedChecks / totalChecks) * 100;
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📊 READINESS SCORE:', `${readinessScore.toFixed(1)}%`);
    
    console.log('\n✅ CHECKS SUMMARY:');
    Object.entries(this.checks).forEach(([check, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const checkName = check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`   ${status} ${checkName}`);
    });
    
    console.log('\n📈 DETAILED RESULTS:');
    console.log(`   Passed Checks: ${this.results.passed}`);
    console.log(`   Failed Checks: ${this.results.failed}`);
    console.log(`   Warnings: ${this.results.warnings}`);
    
    console.log('\n🎯 DEPLOYMENT RECOMMENDATION:');
    if (readinessScore >= 80) {
      console.log('   🟢 READY FOR DEPLOYMENT');
      console.log('   ✅ The application meets the minimum requirements for production deployment.');
      console.log('   🚀 You can proceed with deploying to Vercel.');
      
      if (this.results.warnings > 0) {
        console.log(`   ⚠️  Note: ${this.results.warnings} warnings were found. Consider addressing them for optimal deployment.`);
      }
    } else if (readinessScore >= 60) {
      console.log('   🟡 DEPLOYMENT WITH CAUTION');
      console.log('   ⚠️  The application has some issues but may still be deployable.');
      console.log('   🔧 Consider addressing the failed checks before deployment.');
    } else {
      console.log('   🔴 NOT READY FOR DEPLOYMENT');
      console.log('   ❌ The application has significant issues that should be resolved.');
      console.log('   🛠️  Please address the failed checks before attempting deployment.');
    }
    
    console.log('\n📋 NEXT STEPS:');
    if (readinessScore >= 80) {
      console.log('   1. Run the comprehensive test suite: ./run-all-remaining-tests.js');
      console.log('   2. Review any test failures and fix issues');
      console.log('   3. Deploy to Vercel: ./deploy-to-vercel.sh');
      console.log('   4. Verify deployment at: https://bookmarkhub-web.vercel.app');
    } else {
      console.log('   1. Address the failed checks listed above');
      console.log('   2. Re-run this readiness check');
      console.log('   3. Run tests once readiness score is above 80%');
      console.log('   4. Deploy to Vercel after all issues are resolved');
    }
    
    console.log('\n🏁 Readiness check completed!');
    
    return readinessScore >= 80;
  }

  async runAllChecks() {
    console.log('🔍 BookmarkHub Deployment Readiness Check');
    console.log('='.repeat(60));
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
    
    await this.checkTaskCompletion();
    await this.checkTestScripts();
    await this.checkCodeQuality();
    await this.checkConfiguration();
    await this.checkDocumentation();
    
    const isReady = await this.generateReadinessReport();
    
    // Exit with appropriate code
    process.exit(isReady ? 0 : 1);
  }
}

// Run the readiness check
if (require.main === module) {
  const checker = new DeploymentReadinessChecker();
  checker.runAllChecks().catch((error) => {
    console.error('❌ Readiness check failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentReadinessChecker;
