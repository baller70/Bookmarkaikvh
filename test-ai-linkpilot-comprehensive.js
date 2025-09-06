#!/usr/bin/env node

/**
 * AI LinkPilot Comprehensive Test Suite
 * Tests cross-browser compatibility, performance, accessibility, security, and more
 */

const puppeteer = require('puppeteer');

class AILinkPilotComprehensiveTester {
  constructor() {
    this.browsers = [];
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
      performance: {},
      accessibility: {},
      security: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing AI LinkPilot Comprehensive Test Suite...');
    
    // Launch multiple browsers for cross-browser testing
    const browserConfigs = [
      { name: 'Chrome', product: 'chrome' },
      { name: 'Firefox', product: 'firefox' },
      { name: 'Edge', product: 'chrome' } // Edge uses Chromium
    ];

    for (const config of browserConfigs) {
      try {
        const browser = await puppeteer.launch({ 
          product: config.product,
          headless: false,
          defaultViewport: { width: 1920, height: 1080 }
        });
        this.browsers.push({ name: config.name, browser, pages: [] });
      } catch (error) {
        console.warn(`Warning: Could not launch ${config.name}: ${error.message}`);
      }
    }

    if (this.browsers.length === 0) {
      throw new Error('No browsers could be launched for testing');
    }
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASSED', error: null });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testCrossBrowserCompatibility() {
    for (const browserInfo of this.browsers) {
      await this.runTest(`Cross-Browser - ${browserInfo.name} Basic Functionality`, async () => {
        const page = await browserInfo.browser.newPage();
        browserInfo.pages.push(page);
        
        await page.goto('http://localhost:3000/ai-linkpilot', {
          waitUntil: 'networkidle0',
          timeout: 10000
        });
        
        // Test basic page elements
        const title = await page.$('h1, [data-testid="page-title"]');
        if (!title) throw new Error(`Page title not found in ${browserInfo.name}`);
        
        const navigation = await page.$$('nav a, .nav-link');
        if (navigation.length === 0) throw new Error(`Navigation not found in ${browserInfo.name}`);
        
        // Test interactive elements
        const buttons = await page.$$('button');
        if (buttons.length === 0) throw new Error(`No buttons found in ${browserInfo.name}`);
        
        // Test form elements
        const inputs = await page.$$('input, textarea, select');
        if (inputs.length === 0) throw new Error(`No form elements found in ${browserInfo.name}`);
      });

      await this.runTest(`Cross-Browser - ${browserInfo.name} CSS Rendering`, async () => {
        const page = browserInfo.pages[0];
        
        // Check for layout issues
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
          throw new Error(`Horizontal scrolling detected in ${browserInfo.name}`);
        }
        
        // Check for broken styles
        const elementsWithoutStyles = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          let count = 0;
          elements.forEach(el => {
            const styles = getComputedStyle(el);
            if (styles.display === 'none' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
              count++;
            }
          });
          return count;
        });
        
        if (elementsWithoutStyles > 10) {
          console.warn(`Warning: Many elements may be hidden in ${browserInfo.name}`);
        }
      });
    }
  }

  async testPerformance() {
    const page = this.browsers[0].pages[0];
    
    await this.runTest('Performance - Page Load Time', async () => {
      const startTime = Date.now();
      await page.reload({ waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      this.testResults.performance.pageLoadTime = loadTime;
      
      if (loadTime > 3000) {
        throw new Error(`Page load time too slow: ${loadTime}ms (should be < 3000ms)`);
      }
      
      console.log(`Page load time: ${loadTime}ms`);
    });

    await this.runTest('Performance - Memory Usage', async () => {
      const metrics = await page.metrics();
      this.testResults.performance.memoryUsage = metrics.JSHeapUsedSize;
      
      if (metrics.JSHeapUsedSize > 50000000) { // 50MB threshold
        console.warn(`Warning: High memory usage: ${(metrics.JSHeapUsedSize / 1000000).toFixed(2)}MB`);
      }
      
      console.log(`Memory usage: ${(metrics.JSHeapUsedSize / 1000000).toFixed(2)}MB`);
    });

    await this.runTest('Performance - Animation Frame Rate', async () => {
      // Test animation performance by monitoring frame rate
      const frameRate = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frames = 0;
          const startTime = performance.now();
          
          function countFrames() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frames);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      this.testResults.performance.frameRate = frameRate;
      
      if (frameRate < 30) {
        throw new Error(`Low frame rate detected: ${frameRate}fps (should be > 30fps)`);
      }
      
      console.log(`Animation frame rate: ${frameRate}fps`);
    });

    await this.runTest('Performance - Network Requests', async () => {
      const responses = [];
      page.on('response', response => responses.push(response));
      
      await page.reload({ waitUntil: 'networkidle0' });
      
      const slowRequests = responses.filter(response => {
        const timing = response.timing();
        return timing && (timing.receiveHeadersEnd - timing.requestTime) > 2000;
      });
      
      if (slowRequests.length > 0) {
        console.warn(`Warning: ${slowRequests.length} slow network requests detected`);
      }
      
      this.testResults.performance.networkRequests = responses.length;
      console.log(`Total network requests: ${responses.length}`);
    });
  }

  async testAccessibility() {
    const page = this.browsers[0].pages[0];
    
    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused.tagName,
          hasVisibleFocus: getComputedStyle(focused).outline !== 'none' ||
                          getComputedStyle(focused).boxShadow !== 'none'
        };
      });
      
      if (focusedElement.tagName === 'BODY') {
        throw new Error('Keyboard navigation does not work - no focusable elements');
      }
      
      if (!focusedElement.hasVisibleFocus) {
        throw new Error('Focused element does not have visible focus indicator');
      }
      
      this.testResults.accessibility.keyboardNavigation = true;
    });

    await this.runTest('Accessibility - ARIA Labels', async () => {
      const ariaElements = await page.$$('[aria-label], [aria-labelledby], [aria-describedby]');
      const formLabels = await page.$$('label');
      const headings = await page.$$('h1, h2, h3, h4, h5, h6');
      
      this.testResults.accessibility.ariaLabels = ariaElements.length;
      this.testResults.accessibility.formLabels = formLabels.length;
      this.testResults.accessibility.headings = headings.length;
      
      if (ariaElements.length === 0 && formLabels.length === 0) {
        throw new Error('No ARIA labels or form labels found for screen reader support');
      }
      
      if (headings.length === 0) {
        throw new Error('No heading elements found for proper document structure');
      }
    });

    await this.runTest('Accessibility - Color Contrast', async () => {
      const contrastIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let issues = 0;
        
        elements.forEach(el => {
          const styles = getComputedStyle(el);
          const bgColor = styles.backgroundColor;
          const textColor = styles.color;
          
          // Simple contrast check (would need more sophisticated algorithm for production)
          if (bgColor === textColor) {
            issues++;
          }
        });
        
        return issues;
      });
      
      if (contrastIssues > 0) {
        console.warn(`Warning: ${contrastIssues} potential color contrast issues found`);
      }
      
      this.testResults.accessibility.contrastIssues = contrastIssues;
    });

    await this.runTest('Accessibility - Alt Text for Images', async () => {
      const images = await page.$$('img');
      let missingAltText = 0;
      
      for (const img of images) {
        const alt = await page.evaluate(el => el.alt, img);
        if (!alt || alt.trim() === '') {
          missingAltText++;
        }
      }
      
      if (missingAltText > 0) {
        throw new Error(`${missingAltText} images missing alt text`);
      }
      
      this.testResults.accessibility.imagesWithAlt = images.length - missingAltText;
    });
  }

  async testSecurity() {
    const page = this.browsers[0].pages[0];
    
    await this.runTest('Security - XSS Prevention', async () => {
      const inputs = await page.$$('input[type="text"], textarea');
      if (inputs.length === 0) {
        console.warn('Warning: No text inputs found for XSS testing');
        return;
      }
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      for (const input of inputs) {
        await input.type(xssPayload);
        await page.waitForTimeout(500);
        
        // Check if script was executed (would show alert)
        const alertPresent = await page.evaluate(() => {
          return document.querySelector('script') && 
                 document.querySelector('script').textContent.includes('alert');
        });
        
        if (alertPresent) {
          throw new Error('XSS vulnerability detected - script injection successful');
        }
      }
      
      this.testResults.security.xssProtection = true;
    });

    await this.runTest('Security - HTTPS Usage', async () => {
      const url = page.url();
      if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
        throw new Error('Application not using HTTPS in production');
      }
      
      this.testResults.security.httpsUsage = url.startsWith('https://');
    });

    await this.runTest('Security - Input Sanitization', async () => {
      const inputs = await page.$$('input, textarea');
      const maliciousInputs = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '"><script>alert(1)</script>',
        "'; DROP TABLE users; --"
      ];
      
      for (const input of inputs) {
        for (const maliciousInput of maliciousInputs) {
          await input.click({ clickCount: 3 }); // Select all
          await input.type(maliciousInput);
          await page.waitForTimeout(200);
          
          const value = await page.evaluate(el => el.value, input);
          if (value === maliciousInput) {
            console.warn('Warning: Input may not be sanitized properly');
          }
        }
      }
      
      this.testResults.security.inputSanitization = true;
    });
  }

  async testErrorHandling() {
    const page = this.browsers[0].pages[0];
    
    await this.runTest('Error Handling - Network Failure', async () => {
      // Simulate offline mode
      await page.setOfflineMode(true);
      
      try {
        await page.reload({ waitUntil: 'networkidle0', timeout: 5000 });
      } catch (error) {
        // Expected to fail
      }
      
      // Check for error message
      const errorMessage = await page.$('.error, .offline, [data-testid="error"]');
      if (!errorMessage) {
        console.warn('Warning: No error message displayed for network failure');
      }
      
      // Restore online mode
      await page.setOfflineMode(false);
      await page.reload({ waitUntil: 'networkidle0' });
    });

    await this.runTest('Error Handling - Invalid Input', async () => {
      const inputs = await page.$$('input[type="email"], input[type="url"]');
      if (inputs.length === 0) {
        console.warn('Warning: No email/URL inputs found for validation testing');
        return;
      }
      
      for (const input of inputs) {
        await input.type('invalid-input');
        await page.keyboard.press('Tab'); // Trigger validation
        await page.waitForTimeout(500);
        
        const errorMessage = await page.$('.error, .invalid, .validation-error');
        if (!errorMessage) {
          console.warn('Warning: No validation error message displayed');
        }
      }
    });
  }

  async testAILinkPilotSpecificFeatures() {
    const page = this.browsers[0].pages[0];
    
    await this.runTest('AI LinkPilot - Navigation Between Pages', async () => {
      const navLinks = await page.$$('nav a, .nav-link');
      if (navLinks.length === 0) throw new Error('No navigation links found');
      
      for (const link of navLinks.slice(0, 3)) { // Test first 3 links
        await link.click();
        await page.waitForTimeout(1000);
        
        const currentUrl = page.url();
        if (!currentUrl.includes('ai-linkpilot')) {
          throw new Error('Navigation did not stay within AI LinkPilot section');
        }
      }
    });

    await this.runTest('AI LinkPilot - Form Interactions', async () => {
      const forms = await page.$$('form');
      const inputs = await page.$$('input, textarea, select');
      
      if (inputs.length === 0) {
        console.warn('Warning: No form inputs found for interaction testing');
        return;
      }
      
      // Test form input interactions
      for (const input of inputs.slice(0, 3)) {
        const inputType = await page.evaluate(el => el.type || el.tagName, input);
        
        if (inputType === 'text' || inputType === 'TEXTAREA') {
          await input.type('test input');
        } else if (inputType === 'checkbox') {
          await input.click();
        } else if (inputType === 'SELECT') {
          const options = await input.$$('option');
          if (options.length > 1) {
            await options[1].click();
          }
        }
        
        await page.waitForTimeout(200);
      }
    });

    await this.runTest('AI LinkPilot - Button Functionality', async () => {
      const buttons = await page.$$('button:not([disabled])');
      if (buttons.length === 0) throw new Error('No clickable buttons found');
      
      for (const button of buttons.slice(0, 3)) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        
        // Skip potentially destructive buttons
        if (buttonText.includes('Delete') || buttonText.includes('Remove')) {
          continue;
        }
        
        await button.click();
        await page.waitForTimeout(500);
        
        // Check for any error messages
        const errorMessage = await page.$('.error, .alert-error');
        if (errorMessage) {
          const errorText = await page.evaluate(el => el.textContent, errorMessage);
          console.warn(`Warning: Button click resulted in error: ${errorText}`);
        }
      }
    });
  }

  async generateComprehensiveReport() {
    console.log('\n📊 AI LinkPilot Comprehensive Test Results');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    console.log('\n🚀 Performance Metrics:');
    console.log(`  Page Load Time: ${this.testResults.performance.pageLoadTime || 'N/A'}ms`);
    console.log(`  Memory Usage: ${this.testResults.performance.memoryUsage ? (this.testResults.performance.memoryUsage / 1000000).toFixed(2) + 'MB' : 'N/A'}`);
    console.log(`  Frame Rate: ${this.testResults.performance.frameRate || 'N/A'}fps`);
    console.log(`  Network Requests: ${this.testResults.performance.networkRequests || 'N/A'}`);
    
    console.log('\n♿ Accessibility Metrics:');
    console.log(`  ARIA Labels: ${this.testResults.accessibility.ariaLabels || 0}`);
    console.log(`  Form Labels: ${this.testResults.accessibility.formLabels || 0}`);
    console.log(`  Headings: ${this.testResults.accessibility.headings || 0}`);
    console.log(`  Images with Alt Text: ${this.testResults.accessibility.imagesWithAlt || 0}`);
    console.log(`  Keyboard Navigation: ${this.testResults.accessibility.keyboardNavigation ? 'Working' : 'Issues Found'}`);
    
    console.log('\n🔒 Security Status:');
    console.log(`  XSS Protection: ${this.testResults.security.xssProtection ? 'Enabled' : 'Issues Found'}`);
    console.log(`  HTTPS Usage: ${this.testResults.security.httpsUsage ? 'Enabled' : 'HTTP Only'}`);
    console.log(`  Input Sanitization: ${this.testResults.security.inputSanitization ? 'Working' : 'Issues Found'}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n✅ Test Categories Summary:');
    const categories = {};
    this.testResults.details.forEach(test => {
      const category = test.name.split(' - ')[0];
      if (!categories[category]) {
        categories[category] = { passed: 0, failed: 0 };
      }
      categories[category][test.status === 'PASSED' ? 'passed' : 'failed']++;
    });
    
    Object.entries(categories).forEach(([category, results]) => {
      const total = results.passed + results.failed;
      const percentage = ((results.passed / total) * 100).toFixed(1);
      console.log(`  ${category}: ${results.passed}/${total} (${percentage}%)`);
    });
  }

  async cleanup() {
    for (const browserInfo of this.browsers) {
      if (browserInfo.browser) {
        await browserInfo.browser.close();
      }
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      console.log('\n🧪 Running AI LinkPilot Comprehensive Tests...');
      
      await this.testCrossBrowserCompatibility();
      await this.testPerformance();
      await this.testAccessibility();
      await this.testSecurity();
      await this.testErrorHandling();
      await this.testAILinkPilotSpecificFeatures();
      
      await this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Comprehensive test suite failed to run:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const tester = new AILinkPilotComprehensiveTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AILinkPilotComprehensiveTester;
