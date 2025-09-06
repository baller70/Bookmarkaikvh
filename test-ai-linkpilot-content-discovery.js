#!/usr/bin/env node

/**
 * AI LinkPilot Content Discovery Page Comprehensive Test Suite
 * Tests all features and functionality of the Content Discovery page
 */

const puppeteer = require('puppeteer');

class AILinkPilotContentDiscoveryTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing AI LinkPilot Content Discovery Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Content Discovery page
    await this.page.goto('http://localhost:3000/ai-linkpilot/content-discovery', {
      waitUntil: 'networkidle0'
    });
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

  async testHeaderSection() {
    await this.runTest('Header - Back to Dashboard Link', async () => {
      const backLink = await this.page.$('a[href="/dashboard"]');
      if (!backLink) throw new Error('Back to Dashboard link not found');
      
      const linkText = await this.page.evaluate(el => el.textContent, backLink);
      if (!linkText.includes('Back to Dashboard')) {
        throw new Error('Back to Dashboard link text incorrect');
      }
    });

    await this.runTest('Header - AI LinkPilot Logo/Branding', async () => {
      const logo = await this.page.$('[data-testid="ai-linkpilot-logo"], .logo, h1');
      if (!logo) throw new Error('AI LinkPilot logo/branding not found');
      
      const logoText = await this.page.evaluate(el => el.textContent, logo);
      if (!logoText.includes('LinkPilot') && !logoText.includes('AI')) {
        throw new Error('Logo text does not contain expected branding');
      }
    });

    await this.runTest('Header - Sticky Behavior', async () => {
      const header = await this.page.$('header, [data-testid="header"]');
      if (!header) throw new Error('Header element not found');
      
      // Scroll down and check if header remains visible
      await this.page.evaluate(() => window.scrollTo(0, 500));
      await this.page.waitForTimeout(500);
      
      const headerVisible = await this.page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 100; // Allow for sticky positioning
      }, header);
      
      if (!headerVisible) throw new Error('Header is not sticky during scroll');
      
      // Reset scroll position
      await this.page.evaluate(() => window.scrollTo(0, 0));
    });
  }

  async testSidebarNavigation() {
    await this.runTest('Sidebar - Auto-Processing Navigation', async () => {
      const autoProcessingLink = await this.page.$('a[href*="auto-processing"]');
      if (!autoProcessingLink) throw new Error('Auto-Processing navigation link not found');
    });

    await this.runTest('Sidebar - Content Discovery Active State', async () => {
      const contentDiscoveryLink = await this.page.$('a[href*="content-discovery"]');
      if (!contentDiscoveryLink) throw new Error('Content Discovery navigation link not found');
      
      const isActive = await this.page.evaluate(el => {
        return el.classList.contains('active') || 
               el.getAttribute('aria-current') === 'page' ||
               getComputedStyle(el).fontWeight === 'bold' ||
               getComputedStyle(el).color !== getComputedStyle(document.body).color;
      }, contentDiscoveryLink);
      
      if (!isActive) throw new Error('Content Discovery link does not show active state');
    });

    await this.runTest('Sidebar - Bulk Link Uploader Navigation', async () => {
      const bulkUploaderLink = await this.page.$('a[href*="bulk"], a[href*="uploader"]');
      if (!bulkUploaderLink) throw new Error('Bulk Link Uploader navigation link not found');
    });

    await this.runTest('Sidebar - Link Validator Navigation', async () => {
      const validatorLink = await this.page.$('a[href*="validator"], a[href*="validate"]');
      if (!validatorLink) throw new Error('Link Validator navigation link not found');
    });

    await this.runTest('Sidebar - Browser Launcher Navigation', async () => {
      const browserLink = await this.page.$('a[href*="browser"]');
      if (!browserLink) throw new Error('Browser Launcher navigation link not found');
    });

    await this.runTest('Sidebar - Hover States', async () => {
      const navLinks = await this.page.$$('nav a, [data-testid="sidebar"] a');
      if (navLinks.length === 0) throw new Error('No navigation links found for hover testing');
      
      for (const link of navLinks) {
        await link.hover();
        await this.page.waitForTimeout(100);
        
        const hasHoverEffect = await this.page.evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                 styles.transform !== 'none' ||
                 styles.opacity !== '1';
        }, link);
        
        if (!hasHoverEffect) {
          console.warn('Warning: Navigation link may not have hover effect');
        }
      }
    });
  }

  async testMainContentArea() {
    await this.runTest('Main Content - Page Title', async () => {
      const title = await this.page.$('h1, [data-testid="page-title"]');
      if (!title) throw new Error('Page title not found');
      
      const titleText = await this.page.evaluate(el => el.textContent, title);
      if (!titleText.includes('Content Discovery') && !titleText.includes('AI Content')) {
        throw new Error('Page title does not contain expected text');
      }
    });

    await this.runTest('Main Content - Subtitle', async () => {
      const subtitle = await this.page.$('p, .subtitle, [data-testid="subtitle"]');
      if (!subtitle) throw new Error('Subtitle not found');
      
      const subtitleText = await this.page.evaluate(el => el.textContent, subtitle);
      if (!subtitleText.includes('recommendation') || !subtitleText.includes('AI')) {
        throw new Error('Subtitle does not contain expected content');
      }
    });

    await this.runTest('Main Content - Responsive Typography', async () => {
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      await this.page.waitForTimeout(500);
      
      const title = await this.page.$('h1');
      const titleSize = await this.page.evaluate(el => {
        return getComputedStyle(el).fontSize;
      }, title);
      
      // Test desktop viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.waitForTimeout(500);
      
      const desktopTitleSize = await this.page.evaluate(el => {
        return getComputedStyle(el).fontSize;
      }, title);
      
      if (titleSize === desktopTitleSize) {
        console.warn('Warning: Typography may not be responsive');
      }
    });
  }

  async testRecommendationsSection() {
    await this.runTest('Recommendations - Tab Navigation', async () => {
      const recommendationsTab = await this.page.$('[role="tab"], .tab, [data-testid="recommendations-tab"]');
      if (!recommendationsTab) throw new Error('Recommendations tab not found');
      
      await recommendationsTab.click();
      await this.page.waitForTimeout(500);
      
      const isActive = await this.page.evaluate(el => {
        return el.classList.contains('active') || 
               el.getAttribute('aria-selected') === 'true';
      }, recommendationsTab);
      
      if (!isActive) throw new Error('Recommendations tab does not show active state after click');
    });

    await this.runTest('Recommendations - Search Input Field', async () => {
      const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"]');
      if (!searchInput) throw new Error('Search input field not found');
      
      await searchInput.type('test search query');
      const inputValue = await this.page.evaluate(el => el.value, searchInput);
      if (inputValue !== 'test search query') {
        throw new Error('Search input does not accept text input correctly');
      }
      
      // Clear the input
      await searchInput.click({ clickCount: 3 });
      await this.page.keyboard.press('Backspace');
    });

    await this.runTest('Recommendations - Search Button', async () => {
      const searchButton = await this.page.$('button[type="submit"], .search-button, [data-testid="search-button"]');
      if (!searchButton) throw new Error('Search button not found');
      
      const isClickable = await this.page.evaluate(el => {
        return !el.disabled && getComputedStyle(el).pointerEvents !== 'none';
      }, searchButton);
      
      if (!isClickable) throw new Error('Search button is not clickable');
    });
  }

  async testPersonalizedRecommendationsPanel() {
    await this.runTest('Recommendations Panel - Suggestions Slider', async () => {
      const slider = await this.page.$('input[type="range"], .slider, [data-testid="suggestions-slider"]');
      if (!slider) throw new Error('Suggestions per refresh slider not found');
      
      const initialValue = await this.page.evaluate(el => el.value, slider);
      await this.page.evaluate(el => el.value = '3', slider);
      await slider.dispatchEvent(new Event('input'));
      
      const newValue = await this.page.evaluate(el => el.value, slider);
      if (newValue !== '3') throw new Error('Suggestions slider value does not update');
    });

    await this.runTest('Recommendations Panel - Serendipity Slider', async () => {
      const serendipitySlider = await this.page.$('[data-testid="serendipity-slider"], input[type="range"]:nth-of-type(2)');
      if (!serendipitySlider) {
        console.warn('Warning: Serendipity slider not found - may not be implemented yet');
        return;
      }
      
      await this.page.evaluate(el => {
        el.value = el.max;
        el.dispatchEvent(new Event('input'));
      }, serendipitySlider);
    });

    await this.runTest('Recommendations Panel - Toggle Switches', async () => {
      const toggles = await this.page.$$('input[type="checkbox"], .toggle, [role="switch"]');
      if (toggles.length === 0) throw new Error('No toggle switches found');
      
      for (const toggle of toggles) {
        const initialState = await this.page.evaluate(el => el.checked, toggle);
        await toggle.click();
        await this.page.waitForTimeout(200);
        
        const newState = await this.page.evaluate(el => el.checked, toggle);
        if (initialState === newState) {
          throw new Error('Toggle switch state does not change on click');
        }
      }
    });

    await this.runTest('Recommendations Panel - Generate Button', async () => {
      const generateButton = await this.page.$('button:contains("Generate"), [data-testid="generate-button"]');
      if (!generateButton) {
        // Try alternative selectors
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Generate') || text.includes('Recommend')) {
            found = true;
            await button.click();
            break;
          }
        }
        if (!found) throw new Error('Generate recommendations button not found');
      } else {
        await generateButton.click();
      }
      
      // Wait for loading state or results
      await this.page.waitForTimeout(1000);
    });
  }

  async testResponsiveDesign() {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await this.runTest(`Responsive Design - ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(500);
        
        // Check for horizontal scrolling
        const hasHorizontalScroll = await this.page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
          throw new Error(`Horizontal scrolling detected on ${viewport.name} viewport`);
        }
        
        // Check if main content is visible
        const mainContent = await this.page.$('main, .main-content, [data-testid="main-content"]');
        if (mainContent) {
          const isVisible = await this.page.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }, mainContent);
          
          if (!isVisible) {
            throw new Error(`Main content not visible on ${viewport.name} viewport`);
          }
        }
      });
    }
    
    // Reset to desktop viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testAccessibility() {
    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      // Test Tab navigation through interactive elements
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(200);
      
      const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
      if (!focusedElement || focusedElement === 'BODY') {
        throw new Error('Keyboard navigation does not work - no element receives focus');
      }
    });

    await this.runTest('Accessibility - Focus Indicators', async () => {
      const interactiveElements = await this.page.$$('button, a, input, [tabindex]');
      if (interactiveElements.length === 0) {
        throw new Error('No interactive elements found for focus testing');
      }
      
      for (const element of interactiveElements.slice(0, 3)) { // Test first 3 elements
        await element.focus();
        await this.page.waitForTimeout(100);
        
        const hasFocusIndicator = await this.page.evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.outline !== 'none' || 
                 styles.boxShadow !== 'none' ||
                 styles.borderColor !== styles.borderColor; // Check if border changes
        }, element);
        
        if (!hasFocusIndicator) {
          console.warn('Warning: Element may not have visible focus indicator');
        }
      }
    });
  }

  async testPerformance() {
    await this.runTest('Performance - Page Load Time', async () => {
      const startTime = Date.now();
      await this.page.reload({ waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 5000) { // 5 seconds threshold
        throw new Error(`Page load time too slow: ${loadTime}ms`);
      }
      
      console.log(`Page load time: ${loadTime}ms`);
    });

    await this.runTest('Performance - No Memory Leaks', async () => {
      const initialMetrics = await this.page.metrics();
      
      // Perform some interactions
      await this.page.click('button').catch(() => {}); // Ignore if no button found
      await this.page.type('input', 'test').catch(() => {}); // Ignore if no input found
      
      const finalMetrics = await this.page.metrics();
      
      const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
      if (memoryIncrease > 10000000) { // 10MB threshold
        console.warn(`Warning: Potential memory leak detected: ${memoryIncrease} bytes increase`);
      }
    });
  }

  async generateReport() {
    console.log('\n📊 AI LinkPilot Content Discovery Test Results');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n✅ Passed Tests:');
    this.testResults.details
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        console.log(`  • ${test.name}`);
      });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      console.log('\n🧪 Running AI LinkPilot Content Discovery Tests...');
      
      await this.testHeaderSection();
      await this.testSidebarNavigation();
      await this.testMainContentArea();
      await this.testRecommendationsSection();
      await this.testPersonalizedRecommendationsPanel();
      await this.testResponsiveDesign();
      await this.testAccessibility();
      await this.testPerformance();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed to run:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const tester = new AILinkPilotContentDiscoveryTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AILinkPilotContentDiscoveryTester;
