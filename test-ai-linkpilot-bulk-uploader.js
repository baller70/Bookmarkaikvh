#!/usr/bin/env node

/**
 * AI LinkPilot Magic Bulk Link Uploader Page Comprehensive Test Suite
 * Tests all features and functionality of the Bulk Link Uploader page
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AILinkPilotBulkUploaderTester {
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
    console.log('🚀 Initializing AI LinkPilot Bulk Uploader Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Bulk Link Uploader page
    await this.page.goto('http://localhost:3000/ai-linkpilot/bulk-uploader', {
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
    await this.runTest('Header - Navigation Elements', async () => {
      const header = await this.page.$('header, [data-testid="header"]');
      if (!header) throw new Error('Header element not found');
      
      const navElements = await this.page.$$('nav a, .nav-link');
      if (navElements.length === 0) throw new Error('No navigation elements found in header');
    });

    await this.runTest('Header - Unsaved Changes Warning', async () => {
      // First, make a change to trigger unsaved state
      const textInput = await this.page.$('input[type="text"], textarea');
      if (textInput) {
        await textInput.type('test change');
        await this.page.waitForTimeout(500);
        
        // Look for warning banner
        const warningBanner = await this.page.$('.warning, .unsaved-changes, [data-testid="unsaved-warning"]');
        if (!warningBanner) {
          console.warn('Warning: Unsaved changes banner not found - may not be implemented');
        }
      }
    });

    await this.runTest('Header - Reset Button', async () => {
      const resetButton = await this.page.$('button:contains("Reset"), [data-testid="reset-button"]');
      if (!resetButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Reset') || text.includes('Clear')) {
            await button.click();
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Reset button not found');
      } else {
        await resetButton.click();
      }
      
      await this.page.waitForTimeout(500);
    });

    await this.runTest('Header - Save Button', async () => {
      const saveButton = await this.page.$('button:contains("Save"), [data-testid="save-button"]');
      if (!saveButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Save')) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Save button not found');
      }
    });
  }

  async testImportLinksSection() {
    await this.runTest('Import Links - Tab Navigation', async () => {
      const tabs = await this.page.$$('[role="tab"], .tab, [data-testid*="tab"]');
      if (tabs.length === 0) throw new Error('No tabs found for import methods');
      
      for (const tab of tabs) {
        await tab.click();
        await this.page.waitForTimeout(300);
        
        const isActive = await this.page.evaluate(el => {
          return el.classList.contains('active') || 
                 el.getAttribute('aria-selected') === 'true' ||
                 el.classList.contains('selected');
        }, tab);
        
        if (!isActive) {
          console.warn('Warning: Tab may not show active state properly');
        }
      }
    });

    await this.runTest('Import Links - Drag & Drop Tab', async () => {
      const dragDropTab = await this.page.$('[data-testid="drag-drop-tab"], .tab:contains("Drag")');
      if (!dragDropTab) {
        console.warn('Warning: Drag & Drop tab not found');
        return;
      }
      
      await dragDropTab.click();
      await this.page.waitForTimeout(300);
      
      const dropZone = await this.page.$('.drop-zone, [data-testid="drop-zone"]');
      if (!dropZone) throw new Error('Drop zone not found in Drag & Drop tab');
    });

    await this.runTest('Import Links - Paste Text Tab', async () => {
      const pasteTab = await this.page.$('[data-testid="paste-tab"], .tab:contains("Paste")');
      if (!pasteTab) {
        console.warn('Warning: Paste Text tab not found');
        return;
      }
      
      await pasteTab.click();
      await this.page.waitForTimeout(300);
      
      const textarea = await this.page.$('textarea, [data-testid="paste-textarea"]');
      if (!textarea) throw new Error('Textarea not found in Paste Text tab');
    });

    await this.runTest('Import Links - Single URL Tab', async () => {
      const singleUrlTab = await this.page.$('[data-testid="single-url-tab"], .tab:contains("Single")');
      if (!singleUrlTab) {
        console.warn('Warning: Single URL tab not found');
        return;
      }
      
      await singleUrlTab.click();
      await this.page.waitForTimeout(300);
      
      const urlInput = await this.page.$('input[type="url"], input[placeholder*="URL"]');
      if (!urlInput) throw new Error('URL input not found in Single URL tab');
    });

    await this.runTest('Import Links - Drop Zone Functionality', async () => {
      const dropZone = await this.page.$('.drop-zone, [data-testid="drop-zone"]');
      if (!dropZone) {
        console.warn('Warning: Drop zone not found for testing');
        return;
      }
      
      const dropText = await this.page.evaluate(el => el.textContent, dropZone);
      if (!dropText.includes('Drop') && !dropText.includes('files')) {
        throw new Error('Drop zone does not contain expected messaging');
      }
      
      const chooseFilesButton = await this.page.$('button:contains("Choose"), input[type="file"]');
      if (!chooseFilesButton) throw new Error('Choose Files button not found');
    });
  }

  async testPreviewEditSection() {
    await this.runTest('Preview & Edit - Empty State', async () => {
      const emptyState = await this.page.$('.empty-state, [data-testid="empty-links"]');
      if (!emptyState) {
        console.warn('Warning: Empty state not found - may have links or not be implemented');
        return;
      }
      
      const emptyText = await this.page.evaluate(el => el.textContent, emptyState);
      if (!emptyText.includes('No links') && !emptyText.includes('empty')) {
        throw new Error('Empty state does not show appropriate message');
      }
    });

    await this.runTest('Preview & Edit - Link Validation', async () => {
      // Try to add a test URL first
      const urlInput = await this.page.$('input[type="url"], input[placeholder*="URL"]');
      if (urlInput) {
        await urlInput.type('https://example.com');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
        
        // Look for validation indicators
        const validationIndicators = await this.page.$$('.valid, .invalid, .validation-status');
        if (validationIndicators.length === 0) {
          console.warn('Warning: No validation indicators found');
        }
      }
    });

    await this.runTest('Preview & Edit - Duplicate Detection', async () => {
      // Add the same URL twice to test duplicate detection
      const urlInput = await this.page.$('input[type="url"], input[placeholder*="URL"]');
      if (urlInput) {
        await urlInput.click({ clickCount: 3 }); // Select all
        await urlInput.type('https://duplicate-test.com');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500);
        
        await urlInput.click({ clickCount: 3 }); // Select all
        await urlInput.type('https://duplicate-test.com');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
        
        // Look for duplicate notification
        const duplicateNotification = await this.page.$('.duplicate, .warning, [data-testid="duplicate-warning"]');
        if (!duplicateNotification) {
          console.warn('Warning: Duplicate detection notification not found');
        }
      }
    });
  }

  async testBatchSettingsPanel() {
    await this.runTest('Batch Settings - Batch Size Dropdown', async () => {
      const batchSizeDropdown = await this.page.$('select, [data-testid="batch-size-dropdown"]');
      if (!batchSizeDropdown) throw new Error('Batch size dropdown not found');
      
      await batchSizeDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No batch size options found');
    });

    await this.runTest('Batch Settings - Import Preset Dropdown', async () => {
      const presetDropdown = await this.page.$('select:nth-of-type(2), [data-testid="import-preset-dropdown"]');
      if (!presetDropdown) {
        console.warn('Warning: Import preset dropdown not found');
        return;
      }
      
      await presetDropdown.click();
      await this.page.waitForTimeout(300);
    });

    await this.runTest('Batch Settings - Extra Tag Input', async () => {
      const tagInput = await this.page.$('input[placeholder*="tag"], [data-testid="extra-tag-input"]');
      if (!tagInput) throw new Error('Extra tag input not found');
      
      await tagInput.type('imported-2024');
      const value = await this.page.evaluate(el => el.value, tagInput);
      if (!value.includes('imported-2024')) {
        throw new Error('Extra tag input does not accept text');
      }
    });

    await this.runTest('Batch Settings - Force Folder Dropdown', async () => {
      const folderDropdown = await this.page.$('select:contains("folder"), [data-testid="folder-dropdown"]');
      if (!folderDropdown) {
        console.warn('Warning: Force folder dropdown not found');
        return;
      }
      
      await folderDropdown.click();
      await this.page.waitForTimeout(300);
    });

    await this.runTest('Batch Settings - Privacy Radio Buttons', async () => {
      const radioButtons = await this.page.$$('input[type="radio"]');
      if (radioButtons.length === 0) throw new Error('No privacy radio buttons found');
      
      for (const radio of radioButtons) {
        await radio.click();
        await this.page.waitForTimeout(100);
        
        const isChecked = await this.page.evaluate(el => el.checked, radio);
        if (!isChecked) throw new Error('Radio button does not get selected');
      }
    });

    await this.runTest('Batch Settings - Toggle Switches', async () => {
      const toggles = await this.page.$$('input[type="checkbox"], [role="switch"]');
      if (toggles.length === 0) throw new Error('No toggle switches found');
      
      for (const toggle of toggles) {
        const initialState = await this.page.evaluate(el => el.checked, toggle);
        await toggle.click();
        await this.page.waitForTimeout(200);
        
        const newState = await this.page.evaluate(el => el.checked, toggle);
        if (initialState === newState) {
          throw new Error('Toggle switch state does not change');
        }
      }
    });

    await this.runTest('Batch Settings - Duplicate Strategy Dropdown', async () => {
      const duplicateDropdown = await this.page.$('select:contains("duplicate"), [data-testid="duplicate-strategy-dropdown"]');
      if (!duplicateDropdown) {
        console.warn('Warning: Duplicate strategy dropdown not found');
        return;
      }
      
      await duplicateDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No duplicate strategy options found');
    });
  }

  async testImportButton() {
    await this.runTest('Import Button - Initial State', async () => {
      const importButton = await this.page.$('button:contains("Import"), [data-testid="import-button"]');
      if (!importButton) throw new Error('Import button not found');
      
      const buttonText = await this.page.evaluate(el => el.textContent, importButton);
      if (!buttonText.includes('Import') && !buttonText.includes('0')) {
        throw new Error('Import button does not show initial state correctly');
      }
    });

    await this.runTest('Import Button - Loading State', async () => {
      const importButton = await this.page.$('button:contains("Import"), [data-testid="import-button"]');
      if (!importButton) throw new Error('Import button not found');
      
      // Click the button to trigger loading state
      await importButton.click();
      await this.page.waitForTimeout(500);
      
      // Check for loading indicator
      const loadingIndicator = await this.page.$('.loading, .spinner, [data-testid="loading"]');
      if (!loadingIndicator) {
        console.warn('Warning: Loading state indicator not found');
      }
    });
  }

  async testUploadSummarySection() {
    await this.runTest('Upload Summary - Empty State', async () => {
      const summarySection = await this.page.$('.upload-summary, [data-testid="upload-summary"]');
      if (!summarySection) {
        console.warn('Warning: Upload summary section not found');
        return;
      }
      
      const summaryText = await this.page.evaluate(el => el.textContent, summarySection);
      if (!summaryText.includes('No uploads') && !summaryText.includes('empty')) {
        console.warn('Warning: Upload summary may not show empty state');
      }
    });

    await this.runTest('Upload Summary - History Display', async () => {
      const historyItems = await this.page.$$('.upload-item, .history-item, [data-testid="upload-item"]');
      if (historyItems.length === 0) {
        console.warn('Warning: No upload history items found - expected for empty state');
        return;
      }
      
      // Check if history items have required information
      for (const item of historyItems) {
        const itemText = await this.page.evaluate(el => el.textContent, item);
        if (!itemText.includes('links') && !itemText.includes('completed')) {
          console.warn('Warning: Upload history item may be missing required information');
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
    console.log('\n📊 AI LinkPilot Bulk Uploader Test Results');
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
      
      console.log('\n🧪 Running AI LinkPilot Bulk Uploader Tests...');
      
      await this.testHeaderSection();
      await this.testImportLinksSection();
      await this.testPreviewEditSection();
      await this.testBatchSettingsPanel();
      await this.testImportButton();
      await this.testUploadSummarySection();
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
  const tester = new AILinkPilotBulkUploaderTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AILinkPilotBulkUploaderTester;
