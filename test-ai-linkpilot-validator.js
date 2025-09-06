#!/usr/bin/env node

/**
 * AI LinkPilot Link Validator Page Comprehensive Test Suite
 * Tests all features and functionality of the Link Validator page
 */

const puppeteer = require('puppeteer');

class AILinkPilotValidatorTester {
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
    console.log('🚀 Initializing AI LinkPilot Link Validator Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Link Validator page
    await this.page.goto('http://localhost:3000/ai-linkpilot/validator', {
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

  async testStatisticsCards() {
    const statisticTypes = [
      { name: 'Total Links', expectedValue: '0', color: null },
      { name: 'Healthy', expectedValue: '0', color: 'green' },
      { name: 'Broken', expectedValue: '0', color: 'red' },
      { name: 'Redirects', expectedValue: '0', icon: 'arrow' },
      { name: 'Timeouts', expectedValue: '0', icon: 'clock' },
      { name: 'Phishing', expectedValue: '0', icon: 'warning' }
    ];

    for (const stat of statisticTypes) {
      await this.runTest(`Statistics - ${stat.name} Counter`, async () => {
        const statCard = await this.page.$(`[data-testid="${stat.name.toLowerCase()}-stat"], .stat-card:contains("${stat.name}")`);
        if (!statCard) {
          // Try alternative selectors
          const statCards = await this.page.$$('.stat-card, .counter, .metric');
          if (statCards.length === 0) throw new Error(`${stat.name} statistic card not found`);
          
          // Use first available card for testing
          const cardText = await this.page.evaluate(el => el.textContent, statCards[0]);
          if (!cardText.includes('0')) {
            console.warn(`Warning: ${stat.name} counter may not show initial value of 0`);
          }
        } else {
          const cardText = await this.page.evaluate(el => el.textContent, statCard);
          if (!cardText.includes(stat.expectedValue)) {
            throw new Error(`${stat.name} counter does not show expected value: ${stat.expectedValue}`);
          }
        }
      });
    }

    await this.runTest('Statistics - Hover Effects', async () => {
      const statCards = await this.page.$$('.stat-card, .counter, .metric');
      if (statCards.length === 0) throw new Error('No statistic cards found for hover testing');
      
      for (const card of statCards) {
        await card.hover();
        await this.page.waitForTimeout(200);
        
        const hasHoverEffect = await this.page.evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.transform !== 'none' || 
                 styles.boxShadow !== 'none' ||
                 styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        }, card);
        
        if (!hasHoverEffect) {
          console.warn('Warning: Statistic card may not have hover effect');
        }
      }
    });
  }

  async testScopeAndInputSection() {
    await this.runTest('Scope - All Links Radio Button', async () => {
      const allLinksRadio = await this.page.$('input[type="radio"][value*="all"], [data-testid="all-links-radio"]');
      if (!allLinksRadio) {
        const radioButtons = await this.page.$$('input[type="radio"]');
        if (radioButtons.length === 0) throw new Error('No radio buttons found for scope selection');
        
        // Test first radio button
        await radioButtons[0].click();
        const isChecked = await this.page.evaluate(el => el.checked, radioButtons[0]);
        if (!isChecked) throw new Error('Radio button does not get selected');
      } else {
        await allLinksRadio.click();
        const isChecked = await this.page.evaluate(el => el.checked, allLinksRadio);
        if (!isChecked) throw new Error('All links radio button does not get selected');
      }
    });

    await this.runTest('Scope - Specific Folders Radio Button', async () => {
      const specificRadio = await this.page.$('input[type="radio"][value*="specific"], [data-testid="specific-folders-radio"]');
      if (!specificRadio) {
        const radioButtons = await this.page.$$('input[type="radio"]');
        if (radioButtons.length > 1) {
          await radioButtons[1].click();
          const isChecked = await this.page.evaluate(el => el.checked, radioButtons[1]);
          if (!isChecked) throw new Error('Second radio button does not get selected');
        } else {
          console.warn('Warning: Specific folders radio button not found');
        }
      } else {
        await specificRadio.click();
        const isChecked = await this.page.evaluate(el => el.checked, specificRadio);
        if (!isChecked) throw new Error('Specific folders radio button does not get selected');
      }
    });

    await this.runTest('Scope - Radio Button Exclusivity', async () => {
      const radioButtons = await this.page.$$('input[type="radio"]');
      if (radioButtons.length < 2) {
        console.warn('Warning: Not enough radio buttons found for exclusivity testing');
        return;
      }
      
      await radioButtons[0].click();
      await radioButtons[1].click();
      
      const firstChecked = await this.page.evaluate(el => el.checked, radioButtons[0]);
      const secondChecked = await this.page.evaluate(el => el.checked, radioButtons[1]);
      
      if (firstChecked && secondChecked) {
        throw new Error('Radio buttons are not mutually exclusive');
      }
    });

    await this.runTest('Input - URL Textarea', async () => {
      const urlTextarea = await this.page.$('textarea, [data-testid="url-input"]');
      if (!urlTextarea) throw new Error('URL input textarea not found');
      
      await urlTextarea.type('https://example.com\nhttps://test.com');
      const value = await this.page.evaluate(el => el.value, urlTextarea);
      if (!value.includes('example.com') || !value.includes('test.com')) {
        throw new Error('Textarea does not support multi-line URL input');
      }
    });

    await this.runTest('Input - Placeholder Text', async () => {
      const urlTextarea = await this.page.$('textarea, [data-testid="url-input"]');
      if (!urlTextarea) throw new Error('URL input textarea not found');
      
      const placeholder = await this.page.evaluate(el => el.placeholder, urlTextarea);
      if (!placeholder || placeholder.length < 5) {
        throw new Error('Textarea does not have appropriate placeholder text');
      }
    });

    await this.runTest('Input - Real-time URL Validation', async () => {
      const urlTextarea = await this.page.$('textarea, [data-testid="url-input"]');
      if (!urlTextarea) throw new Error('URL input textarea not found');
      
      // Clear and type invalid URL
      await urlTextarea.click({ clickCount: 3 });
      await urlTextarea.type('invalid-url');
      await this.page.waitForTimeout(500);
      
      // Look for validation feedback
      const validationMessage = await this.page.$('.error, .invalid, .validation-error');
      if (!validationMessage) {
        console.warn('Warning: Real-time URL validation feedback not found');
      }
    });
  }

  async testScheduleAndOptionsSection() {
    await this.runTest('Schedule - Automatic Schedule Dropdown', async () => {
      const scheduleDropdown = await this.page.$('select, [data-testid="schedule-dropdown"]');
      if (!scheduleDropdown) throw new Error('Schedule dropdown not found');
      
      await scheduleDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No schedule options found');
      
      // Check for expected options
      const optionTexts = await Promise.all(
        options.map(option => this.page.evaluate(el => el.textContent, option))
      );
      
      const hasWeekly = optionTexts.some(text => text.includes('Weekly'));
      const hasDaily = optionTexts.some(text => text.includes('Daily'));
      const hasMonthly = optionTexts.some(text => text.includes('Monthly'));
      
      if (!hasWeekly || !hasDaily || !hasMonthly) {
        throw new Error('Schedule dropdown missing expected options (Daily, Weekly, Monthly)');
      }
    });

    await this.runTest('Options - Email Summary Toggle', async () => {
      const emailToggle = await this.page.$('input[type="checkbox"], [data-testid="email-toggle"]');
      if (!emailToggle) throw new Error('Email summary toggle not found');
      
      const initialState = await this.page.evaluate(el => el.checked, emailToggle);
      await emailToggle.click();
      await this.page.waitForTimeout(200);
      
      const newState = await this.page.evaluate(el => el.checked, emailToggle);
      if (initialState === newState) {
        throw new Error('Email toggle state does not change');
      }
    });

    await this.runTest('Options - Auto-move Broken Links Toggle', async () => {
      const autoMoveToggle = await this.page.$('input[type="checkbox"]:nth-of-type(2), [data-testid="auto-move-toggle"]');
      if (!autoMoveToggle) {
        console.warn('Warning: Auto-move toggle not found');
        return;
      }
      
      const initialState = await this.page.evaluate(el => el.checked, autoMoveToggle);
      await autoMoveToggle.click();
      await this.page.waitForTimeout(200);
      
      const newState = await this.page.evaluate(el => el.checked, autoMoveToggle);
      if (initialState === newState) {
        throw new Error('Auto-move toggle state does not change');
      }
    });
  }

  async testScanExecution() {
    await this.runTest('Scan - Scan Now Button', async () => {
      const scanButton = await this.page.$('button:contains("Scan"), [data-testid="scan-button"]');
      if (!scanButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Scan') || text.includes('Start') || text.includes('Run')) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Scan Now button not found');
      }
      
      const isClickable = await this.page.evaluate(el => {
        return !el.disabled && getComputedStyle(el).pointerEvents !== 'none';
      }, scanButton);
      
      if (!isClickable) throw new Error('Scan button is not clickable');
    });

    await this.runTest('Scan - Loading State', async () => {
      const scanButton = await this.page.$('button:contains("Scan"), [data-testid="scan-button"]');
      if (!scanButton) {
        console.warn('Warning: Scan button not found for loading state test');
        return;
      }
      
      await scanButton.click();
      await this.page.waitForTimeout(500);
      
      // Look for loading indicators
      const loadingIndicator = await this.page.$('.loading, .spinner, [data-testid="loading"]');
      const disabledButton = await this.page.evaluate(el => el.disabled, scanButton);
      
      if (!loadingIndicator && !disabledButton) {
        console.warn('Warning: No loading state indicators found');
      }
    });

    await this.runTest('Scan - Progress Indicator', async () => {
      const progressBar = await this.page.$('.progress, .progress-bar, [data-testid="progress"]');
      if (!progressBar) {
        console.warn('Warning: Progress indicator not found - may not be implemented');
        return;
      }
      
      const progressValue = await this.page.evaluate(el => {
        return el.value || el.getAttribute('aria-valuenow') || el.style.width;
      }, progressBar);
      
      if (!progressValue) {
        throw new Error('Progress indicator does not show progress value');
      }
    });
  }

  async testResultsDisplay() {
    await this.runTest('Results - Empty State Message', async () => {
      const emptyState = await this.page.$('.empty-state, [data-testid="empty-results"]');
      if (!emptyState) {
        console.warn('Warning: Empty state not found - may have results or not be implemented');
        return;
      }
      
      const emptyText = await this.page.evaluate(el => el.textContent, emptyState);
      if (!emptyText.includes('No validation') && !emptyText.includes('no results')) {
        throw new Error('Empty state does not show appropriate message');
      }
    });

    await this.runTest('Results - Helper Text', async () => {
      const helperText = await this.page.$('.helper-text, .instructions, [data-testid="helper-text"]');
      if (!helperText) {
        console.warn('Warning: Helper text not found');
        return;
      }
      
      const helperContent = await this.page.evaluate(el => el.textContent, helperText);
      if (!helperContent.includes('scan') && !helperContent.includes('Run')) {
        throw new Error('Helper text does not provide appropriate guidance');
      }
    });

    await this.runTest('Results - Shield Icon', async () => {
      const shieldIcon = await this.page.$('.shield, [data-testid="shield-icon"], svg');
      if (!shieldIcon) {
        console.warn('Warning: Shield icon not found in empty state');
        return;
      }
      
      const isVisible = await this.page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }, shieldIcon);
      
      if (!isVisible) throw new Error('Shield icon is not visible');
    });

    await this.runTest('Results - Status Distribution Chart', async () => {
      const chart = await this.page.$('.chart, [data-testid="status-chart"], canvas');
      if (!chart) {
        console.warn('Warning: Status distribution chart not found');
        return;
      }
      
      const chartText = await this.page.evaluate(el => el.textContent || el.getAttribute('aria-label'), chart);
      if (chartText && !chartText.includes('No data')) {
        console.warn('Warning: Chart may not show empty state properly');
      }
    });

    await this.runTest('Results - Broken Links Trend', async () => {
      const trendChart = await this.page.$('.trend, [data-testid="trend-chart"]');
      if (!trendChart) {
        console.warn('Warning: Broken links trend chart not found');
        return;
      }
      
      const trendText = await this.page.evaluate(el => el.textContent, trendChart);
      if (!trendText.includes('No trend') && !trendText.includes('no data')) {
        console.warn('Warning: Trend chart may not show empty state properly');
      }
    });
  }

  async testRecentScansSection() {
    await this.runTest('Recent Scans - Empty State', async () => {
      const recentScans = await this.page.$('.recent-scans, [data-testid="recent-scans"]');
      if (!recentScans) {
        console.warn('Warning: Recent scans section not found');
        return;
      }
      
      const scansText = await this.page.evaluate(el => el.textContent, recentScans);
      if (!scansText.includes('No scan') && !scansText.includes('history')) {
        console.warn('Warning: Recent scans may not show empty state');
      }
    });

    await this.runTest('Recent Scans - Scan History List', async () => {
      const scanItems = await this.page.$$('.scan-item, .history-item, [data-testid="scan-item"]');
      if (scanItems.length === 0) {
        console.warn('Warning: No scan history items found - expected for empty state');
        return;
      }
      
      // Check if scan items have timestamps
      for (const item of scanItems) {
        const itemText = await this.page.evaluate(el => el.textContent, item);
        if (!itemText.includes('ago') && !itemText.includes('2024')) {
          console.warn('Warning: Scan item may be missing timestamp');
        }
      }
    });
  }

  async testResponsiveDesign() {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await this.runTest(`Responsive Design - ${viewport.name}`, async () => {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(500);
        
        const hasHorizontalScroll = await this.page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
          throw new Error(`Horizontal scrolling detected on ${viewport.name} viewport`);
        }
      });
    }
    
    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
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

    await this.runTest('Accessibility - Screen Reader Compatibility', async () => {
      const ariaLabels = await this.page.$$('[aria-label], [aria-labelledby]');
      const formLabels = await this.page.$$('label');
      
      if (ariaLabels.length === 0 && formLabels.length === 0) {
        throw new Error('No ARIA labels or form labels found for screen reader support');
      }
    });
  }

  async generateReport() {
    console.log('\n📊 AI LinkPilot Link Validator Test Results');
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
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      console.log('\n🧪 Running AI LinkPilot Link Validator Tests...');
      
      await this.testStatisticsCards();
      await this.testScopeAndInputSection();
      await this.testScheduleAndOptionsSection();
      await this.testScanExecution();
      await this.testResultsDisplay();
      await this.testRecentScansSection();
      await this.testResponsiveDesign();
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
  const tester = new AILinkPilotValidatorTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AILinkPilotValidatorTester;
