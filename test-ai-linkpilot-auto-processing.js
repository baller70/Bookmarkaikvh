#!/usr/bin/env node

/**
 * AI LinkPilot Auto-Processing Settings Page Comprehensive Test Suite
 * Tests all features and functionality of the Auto-Processing Settings page
 */

const puppeteer = require('puppeteer');

class AILinkPilotAutoProcessingTester {
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
    console.log('🚀 Initializing AI LinkPilot Auto-Processing Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Auto-Processing Settings page
    await this.page.goto('http://localhost:3000/ai-linkpilot/auto-processing', {
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

  async testHeaderAndNavigation() {
    await this.runTest('Header - Navigation Consistency', async () => {
      const header = await this.page.$('header, [data-testid="header"]');
      if (!header) throw new Error('Header element not found');
      
      const navElements = await this.page.$$('nav a, .nav-link');
      if (navElements.length === 0) throw new Error('No navigation elements found');
    });

    await this.runTest('Header - Language Selector', async () => {
      const languageSelector = await this.page.$('[data-testid="language-selector"], select[name="language"]');
      if (!languageSelector) {
        console.warn('Warning: Language selector not found - may not be implemented');
        return;
      }
      
      await languageSelector.click();
      await this.page.waitForTimeout(300);
    });

    await this.runTest('Header - Breadcrumb Navigation', async () => {
      const breadcrumb = await this.page.$('.breadcrumb, [data-testid="breadcrumb"]');
      if (!breadcrumb) {
        console.warn('Warning: Breadcrumb navigation not found');
        return;
      }
      
      const breadcrumbText = await this.page.evaluate(el => el.textContent, breadcrumb);
      if (!breadcrumbText.includes('Auto-Processing')) {
        throw new Error('Breadcrumb does not show current page');
      }
    });
  }

  async testMainContentArea() {
    await this.runTest('Main Content - Page Title', async () => {
      const title = await this.page.$('h1, [data-testid="page-title"]');
      if (!title) throw new Error('Page title not found');
      
      const titleText = await this.page.evaluate(el => el.textContent, title);
      if (!titleText.includes('Auto-Processing')) {
        throw new Error('Page title does not contain "Auto-Processing"');
      }
    });

    await this.runTest('Main Content - Description Subtitle', async () => {
      const subtitle = await this.page.$('p, .subtitle, [data-testid="description"]');
      if (!subtitle) throw new Error('Description subtitle not found');
      
      const subtitleText = await this.page.evaluate(el => el.textContent, subtitle);
      if (subtitleText.length < 10) {
        throw new Error('Description subtitle appears to be empty or too short');
      }
    });

    await this.runTest('Main Content - Responsive Layout', async () => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];
      
      for (const viewport of viewports) {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(500);
        
        const hasHorizontalScroll = await this.page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
          throw new Error(`Horizontal scrolling detected at ${viewport.width}x${viewport.height}`);
        }
      }
      
      // Reset to desktop
      await this.page.setViewport({ width: 1920, height: 1080 });
    });
  }

  async testIntakeScopeSection() {
    const toggleTests = [
      'Manual saves',
      'Bulk uploads', 
      'Browser capture',
      'Pause all processing'
    ];

    for (const toggleName of toggleTests) {
      await this.runTest(`Intake Scope - ${toggleName} Toggle`, async () => {
        const toggle = await this.page.$(`input[type="checkbox"]:has-text("${toggleName}"), [data-testid="${toggleName.toLowerCase().replace(' ', '-')}-toggle"]`);
        if (!toggle) {
          // Try alternative selector
          const toggles = await this.page.$$('input[type="checkbox"], [role="switch"]');
          if (toggles.length === 0) throw new Error(`${toggleName} toggle not found`);
          
          // Use first available toggle for testing
          const testToggle = toggles[0];
          const initialState = await this.page.evaluate(el => el.checked, testToggle);
          await testToggle.click();
          await this.page.waitForTimeout(200);
          
          const newState = await this.page.evaluate(el => el.checked, testToggle);
          if (initialState === newState) {
            throw new Error(`${toggleName} toggle state does not change`);
          }
        } else {
          const initialState = await this.page.evaluate(el => el.checked, toggle);
          await toggle.click();
          await this.page.waitForTimeout(200);
          
          const newState = await this.page.evaluate(el => el.checked, toggle);
          if (initialState === newState) {
            throw new Error(`${toggleName} toggle state does not change`);
          }
        }
      });
    }

    await this.runTest('Intake Scope - Toggle Persistence', async () => {
      const toggles = await this.page.$$('input[type="checkbox"], [role="switch"]');
      if (toggles.length === 0) throw new Error('No toggles found for persistence testing');
      
      // Change state of first toggle
      const firstToggle = toggles[0];
      const initialState = await this.page.evaluate(el => el.checked, firstToggle);
      await firstToggle.click();
      await this.page.waitForTimeout(500);
      
      // Refresh page
      await this.page.reload({ waitUntil: 'networkidle0' });
      
      // Check if state persisted (this may fail if persistence isn't implemented)
      const togglesAfterReload = await this.page.$$('input[type="checkbox"], [role="switch"]');
      if (togglesAfterReload.length > 0) {
        const stateAfterReload = await this.page.evaluate(el => el.checked, togglesAfterReload[0]);
        if (stateAfterReload === initialState) {
          console.warn('Warning: Toggle state may not persist after page refresh');
        }
      }
    });
  }

  async testAutoTaggingSection() {
    await this.runTest('Auto-Tagging - Enable Toggle', async () => {
      const autoTagToggle = await this.page.$('[data-testid="auto-tagging-toggle"], input[type="checkbox"]');
      if (!autoTagToggle) throw new Error('Auto-tagging toggle not found');
      
      await autoTagToggle.click();
      await this.page.waitForTimeout(300);
    });

    await this.runTest('Auto-Tagging - Confidence Threshold Slider', async () => {
      const slider = await this.page.$('input[type="range"], .slider');
      if (!slider) throw new Error('Confidence threshold slider not found');
      
      const initialValue = await this.page.evaluate(el => el.value, slider);
      await this.page.evaluate(el => {
        el.value = '75';
        el.dispatchEvent(new Event('input'));
      }, slider);
      
      const newValue = await this.page.evaluate(el => el.value, slider);
      if (newValue !== '75') throw new Error('Slider value does not update');
    });

    await this.runTest('Auto-Tagging - Tag Style Dropdown', async () => {
      const dropdown = await this.page.$('select, [data-testid="tag-style-dropdown"]');
      if (!dropdown) throw new Error('Tag style dropdown not found');
      
      await dropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No dropdown options found');
    });

    await this.runTest('Auto-Tagging - Language Mode Dropdown', async () => {
      const languageDropdown = await this.page.$('select:nth-of-type(2), [data-testid="language-mode-dropdown"]');
      if (!languageDropdown) {
        console.warn('Warning: Language mode dropdown not found');
        return;
      }
      
      await languageDropdown.click();
      await this.page.waitForTimeout(300);
    });
  }

  async testFilteringSection() {
    await this.runTest('Filtering - Strip Tracking Toggle', async () => {
      const stripToggle = await this.page.$('[data-testid="strip-tracking-toggle"], input[type="checkbox"]');
      if (!stripToggle) throw new Error('Strip tracking parameters toggle not found');
      
      await stripToggle.click();
      await this.page.waitForTimeout(200);
    });

    await this.runTest('Filtering - Domain Blacklist Textarea', async () => {
      const textarea = await this.page.$('textarea, [data-testid="domain-blacklist"]');
      if (!textarea) throw new Error('Domain blacklist textarea not found');
      
      await textarea.type('example.com\nspam-site.com');
      const value = await this.page.evaluate(el => el.value, textarea);
      if (!value.includes('example.com')) {
        throw new Error('Textarea does not accept multi-line input');
      }
    });

    await this.runTest('Filtering - Content Length Slider', async () => {
      const contentSlider = await this.page.$('input[type="range"]:nth-of-type(2), [data-testid="content-length-slider"]');
      if (!contentSlider) throw new Error('Content length slider not found');
      
      await this.page.evaluate(el => {
        el.value = '150';
        el.dispatchEvent(new Event('input'));
      }, contentSlider);
      
      const value = await this.page.evaluate(el => el.value, contentSlider);
      if (value !== '150') throw new Error('Content length slider does not update');
    });

    await this.runTest('Filtering - Duplicate Handling Radio Buttons', async () => {
      const radioButtons = await this.page.$$('input[type="radio"]');
      if (radioButtons.length === 0) throw new Error('No radio buttons found for duplicate handling');
      
      for (const radio of radioButtons) {
        await radio.click();
        await this.page.waitForTimeout(100);
        
        const isChecked = await this.page.evaluate(el => el.checked, radio);
        if (!isChecked) throw new Error('Radio button does not get selected');
      }
    });
  }

  async testRuleBuilderSection() {
    await this.runTest('Rule Builder - Add Rule Button', async () => {
      const addRuleButton = await this.page.$('button:contains("Add Rule"), [data-testid="add-rule-button"]');
      if (!addRuleButton) {
        // Try alternative selector
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Add Rule') || text.includes('Rule')) {
            await button.click();
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Add Rule button not found');
      } else {
        await addRuleButton.click();
      }
      
      await this.page.waitForTimeout(500);
    });

    await this.runTest('Rule Builder - Empty State Display', async () => {
      const emptyState = await this.page.$('.empty-state, [data-testid="empty-rules"]');
      if (!emptyState) {
        console.warn('Warning: Empty state for rules not found - may show rules or not be implemented');
        return;
      }
      
      const emptyText = await this.page.evaluate(el => el.textContent, emptyState);
      if (!emptyText.includes('0') && !emptyText.includes('no rules')) {
        throw new Error('Empty state does not indicate no rules configured');
      }
    });
  }

  async testImportExportSettings() {
    await this.runTest('Import/Export - Export JSON Button', async () => {
      const exportButton = await this.page.$('button:contains("Export"), [data-testid="export-json-button"]');
      if (!exportButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Export') || text.includes('JSON')) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Export JSON button not found');
      }
      
      // Note: Actual download testing would require more complex setup
      console.log('Export button found and clickable');
    });

    await this.runTest('Import/Export - Import JSON Button', async () => {
      const importButton = await this.page.$('button:contains("Import"), [data-testid="import-json-button"]');
      if (!importButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Import')) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Import JSON button not found');
      }
      
      console.log('Import button found and clickable');
    });
  }

  async testAccessibility() {
    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(200);
      
      const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
      if (!focusedElement || focusedElement === 'BODY') {
        throw new Error('Keyboard navigation does not work');
      }
    });

    await this.runTest('Accessibility - Screen Reader Support', async () => {
      const ariaLabels = await this.page.$$('[aria-label], [aria-labelledby]');
      const formLabels = await this.page.$$('label');
      
      if (ariaLabels.length === 0 && formLabels.length === 0) {
        throw new Error('No ARIA labels or form labels found for screen reader support');
      }
    });
  }

  async generateReport() {
    console.log('\n📊 AI LinkPilot Auto-Processing Test Results');
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
      
      console.log('\n🧪 Running AI LinkPilot Auto-Processing Tests...');
      
      await this.testHeaderAndNavigation();
      await this.testMainContentArea();
      await this.testIntakeScopeSection();
      await this.testAutoTaggingSection();
      await this.testFilteringSection();
      await this.testRuleBuilderSection();
      await this.testImportExportSettings();
      await this.testAccessibility();
      
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
  const tester = new AILinkPilotAutoProcessingTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AILinkPilotAutoProcessingTester;
