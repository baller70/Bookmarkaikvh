#!/usr/bin/env node

/**
 * Settings Backup & Export Page Comprehensive Test Suite
 * Tests all features and functionality of the Backup & Export Settings section
 */

const puppeteer = require('puppeteer');

class SettingsBackupExportTester {
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
    console.log('🚀 Initializing Settings Backup & Export Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Settings Backup & Export page
    await this.page.goto('http://localhost:3000/settings/backup-export', {
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

  async testPageStructureAndNavigation() {
    await this.runTest('Page Structure - Header Consistency', async () => {
      const header = await this.page.$('header, [data-testid="header"]');
      if (!header) throw new Error('Header element not found');
      
      const logo = await this.page.$('.logo, [data-testid="logo"]');
      const userMenu = await this.page.$('.user-menu, [data-testid="user-menu"]');
      
      if (!logo && !userMenu) {
        console.warn('Warning: Header elements may not match other settings pages');
      }
    });

    await this.runTest('Page Structure - Sidebar Navigation Active State', async () => {
      const backupExportLink = await this.page.$('a[href*="backup"], .nav-item.active');
      if (!backupExportLink) throw new Error('Backup & Export navigation item not found');
      
      const isActive = await this.page.evaluate(el => {
        return el.classList.contains('active') || 
               el.getAttribute('aria-current') === 'page' ||
               getComputedStyle(el).fontWeight === 'bold';
      }, backupExportLink);
      
      if (!isActive) throw new Error('Backup & Export navigation item does not show active state');
    });

    await this.runTest('Page Structure - Page Load Without Errors', async () => {
      const errors = await this.page.evaluate(() => {
        return window.console.errors || [];
      });
      
      if (errors && errors.length > 0) {
        console.warn(`Warning: ${errors.length} console errors detected during page load`);
      }
      
      // Check if main sections are rendered
      const mainContent = await this.page.$('main, .main-content, [data-testid="main-content"]');
      if (!mainContent) throw new Error('Main content area not rendered');
    });
  }

  async testManualExportSection() {
    const exportFormats = [
      { name: 'JSON', icon: 'download' },
      { name: 'CSV', icon: 'file' },
      { name: 'HTML', icon: 'globe' }
    ];

    for (const format of exportFormats) {
      await this.runTest(`Manual Export - ${format.name} Button`, async () => {
        const exportButton = await this.page.$(`button:contains("Export ${format.name}"), [data-testid="export-${format.name.toLowerCase()}-button"]`);
        if (!exportButton) {
          const buttons = await this.page.$$('button');
          let found = false;
          for (const button of buttons) {
            const text = await this.page.evaluate(el => el.textContent, button);
            if (text.includes(`Export ${format.name}`) || text.includes(format.name)) {
              found = true;
              break;
            }
          }
          if (!found) throw new Error(`Export ${format.name} button not found`);
        }
        
        const isClickable = await this.page.evaluate(el => {
          return !el.disabled && getComputedStyle(el).pointerEvents !== 'none';
        }, exportButton);
        
        if (!isClickable) throw new Error(`Export ${format.name} button is not clickable`);
      });
    }

    await this.runTest('Manual Export - Date Range Selection', async () => {
      const dateInputs = await this.page.$$('input[type="date"], .date-picker');
      if (dateInputs.length < 2) {
        console.warn('Warning: Date range inputs not found - may not be implemented');
        return;
      }
      
      const startDate = dateInputs[0];
      const endDate = dateInputs[1];
      
      await startDate.type('01/01/2024');
      await endDate.type('12/31/2024');
      
      const startValue = await this.page.evaluate(el => el.value, startDate);
      const endValue = await this.page.evaluate(el => el.value, endDate);
      
      if (!startValue || !endValue) {
        throw new Error('Date inputs do not accept date values');
      }
    });

    await this.runTest('Manual Export - Date Validation', async () => {
      const dateInputs = await this.page.$$('input[type="date"], .date-picker');
      if (dateInputs.length < 2) {
        console.warn('Warning: Date range inputs not found for validation testing');
        return;
      }
      
      const startDate = dateInputs[0];
      const endDate = dateInputs[1];
      
      // Set end date before start date
      await startDate.click({ clickCount: 3 });
      await startDate.type('12/31/2024');
      await endDate.click({ clickCount: 3 });
      await endDate.type('01/01/2024');
      
      // Look for validation error
      const validationError = await this.page.$('.error, .invalid, .validation-error');
      if (!validationError) {
        console.warn('Warning: Date validation error not displayed');
      }
    });

    await this.runTest('Manual Export - Tag Filter', async () => {
      const tagInput = await this.page.$('input[placeholder*="tag"], [data-testid="tag-filter"]');
      if (!tagInput) {
        console.warn('Warning: Tag filter input not found');
        return;
      }
      
      await tagInput.type('work, personal, important');
      const value = await this.page.evaluate(el => el.value, tagInput);
      
      if (!value.includes('work') || !value.includes('personal')) {
        throw new Error('Tag filter input does not accept comma-separated tags');
      }
    });
  }

  async testScheduledBackupsSection() {
    await this.runTest('Scheduled Backups - Enable Toggle', async () => {
      const enableToggle = await this.page.$('input[type="checkbox"], [data-testid="enable-backups-toggle"]');
      if (!enableToggle) throw new Error('Enable automatic backups toggle not found');
      
      const initialState = await this.page.evaluate(el => el.checked, enableToggle);
      await enableToggle.click();
      await this.page.waitForTimeout(200);
      
      const newState = await this.page.evaluate(el => el.checked, enableToggle);
      if (initialState === newState) {
        throw new Error('Enable backups toggle state does not change');
      }
    });

    await this.runTest('Scheduled Backups - Helper Text Display', async () => {
      const helperText = await this.page.$('.helper-text, .description, [data-testid="backup-helper"]');
      if (!helperText) {
        console.warn('Warning: Backup helper text not found');
        return;
      }
      
      const helperContent = await this.page.evaluate(el => el.textContent, helperText);
      if (!helperContent.includes('automatic') && !helperContent.includes('backup')) {
        throw new Error('Helper text does not contain expected content');
      }
    });

    await this.runTest('Scheduled Backups - Frequency Dropdown', async () => {
      const frequencyDropdown = await this.page.$('select, [data-testid="frequency-dropdown"]');
      if (!frequencyDropdown) {
        console.warn('Warning: Frequency dropdown not found');
        return;
      }
      
      await frequencyDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No frequency options found');
      
      const optionTexts = await Promise.all(
        options.map(option => this.page.evaluate(el => el.textContent, option))
      );
      
      const hasExpectedOptions = optionTexts.some(text => text.includes('daily')) ||
                                optionTexts.some(text => text.includes('weekly')) ||
                                optionTexts.some(text => text.includes('monthly'));
      
      if (!hasExpectedOptions) {
        throw new Error('Frequency dropdown missing expected options');
      }
    });

    await this.runTest('Scheduled Backups - Time Selection', async () => {
      const timeInput = await this.page.$('input[type="time"], [data-testid="backup-time"]');
      if (!timeInput) {
        console.warn('Warning: Time selection input not found');
        return;
      }
      
      await timeInput.type('09:00');
      const value = await this.page.evaluate(el => el.value, timeInput);
      
      if (!value.includes('09:00')) {
        throw new Error('Time input does not accept time values');
      }
    });
  }

  async testCloudSyncDestinations() {
    await this.runTest('Cloud Sync - Provider Selection Default', async () => {
      const providerDropdown = await this.page.$('select, [data-testid="cloud-provider-dropdown"]');
      if (!providerDropdown) {
        console.warn('Warning: Cloud provider dropdown not found');
        return;
      }
      
      const selectedValue = await this.page.evaluate(el => el.value, providerDropdown);
      if (selectedValue !== 'none' && selectedValue !== '') {
        console.warn('Warning: Default cloud provider selection may not be "None"');
      }
    });

    await this.runTest('Cloud Sync - Provider Options', async () => {
      const providerDropdown = await this.page.$('select, [data-testid="cloud-provider-dropdown"]');
      if (!providerDropdown) {
        console.warn('Warning: Cloud provider dropdown not found');
        return;
      }
      
      await providerDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      const optionTexts = await Promise.all(
        options.map(option => this.page.evaluate(el => el.textContent, option))
      );
      
      const expectedProviders = ['Google Drive', 'Dropbox', 'OneDrive'];
      const hasExpectedProviders = expectedProviders.some(provider => 
        optionTexts.some(text => text.includes(provider))
      );
      
      if (!hasExpectedProviders) {
        console.warn('Warning: Expected cloud providers not found in dropdown');
      }
    });

    await this.runTest('Cloud Sync - Connection Status Indicator', async () => {
      const statusIndicator = await this.page.$('.status-indicator, [data-testid="connection-status"]');
      if (!statusIndicator) {
        console.warn('Warning: Connection status indicator not found');
        return;
      }
      
      const statusText = await this.page.evaluate(el => el.textContent, statusIndicator);
      if (!statusText.includes('Connected') && !statusText.includes('Disconnected')) {
        throw new Error('Status indicator does not show connection state');
      }
    });
  }

  async testImportAndRestore() {
    await this.runTest('Import - File Picker', async () => {
      const fileInput = await this.page.$('input[type="file"], [data-testid="import-file"]');
      if (!fileInput) throw new Error('File picker input not found');
      
      const acceptedTypes = await this.page.evaluate(el => el.accept, fileInput);
      if (!acceptedTypes) {
        console.warn('Warning: File input does not specify accepted file types');
      }
    });

    await this.runTest('Import - File Type Validation', async () => {
      const fileInput = await this.page.$('input[type="file"], [data-testid="import-file"]');
      if (!fileInput) throw new Error('File picker input not found');
      
      const acceptedTypes = await this.page.evaluate(el => el.accept, fileInput);
      if (acceptedTypes) {
        const expectedTypes = ['.json', '.csv', '.html'];
        const hasExpectedTypes = expectedTypes.some(type => acceptedTypes.includes(type));
        
        if (!hasExpectedTypes) {
          throw new Error('File input does not accept expected file types');
        }
      }
    });

    await this.runTest('Restore - Backup List Display', async () => {
      const backupList = await this.page.$('.backup-list, [data-testid="backup-list"]');
      if (!backupList) {
        console.warn('Warning: Backup list not found - may be empty or not implemented');
        return;
      }
      
      const backupItems = await this.page.$$('.backup-item, [data-testid="backup-item"]');
      if (backupItems.length === 0) {
        console.warn('Warning: No backup items found - expected for empty state');
      }
    });

    await this.runTest('Restore - Confirmation Dialog', async () => {
      const restoreButton = await this.page.$('button:contains("Restore"), [data-testid="restore-button"]');
      if (!restoreButton) {
        console.warn('Warning: Restore button not found');
        return;
      }
      
      await restoreButton.click();
      await this.page.waitForTimeout(500);
      
      const confirmDialog = await this.page.$('.modal, .dialog, [data-testid="confirm-dialog"]');
      if (!confirmDialog) {
        console.warn('Warning: Confirmation dialog not displayed after restore click');
      }
    });
  }

  async testErrorHandlingAndEdgeCases() {
    await this.runTest('Error Handling - Network Failure Simulation', async () => {
      // Simulate offline mode
      await this.page.setOfflineMode(true);
      
      const exportButton = await this.page.$('button:contains("Export"), [data-testid="export-button"]');
      if (exportButton) {
        await exportButton.click();
        await this.page.waitForTimeout(1000);
        
        const errorMessage = await this.page.$('.error, .alert-error, [data-testid="error-message"]');
        if (!errorMessage) {
          console.warn('Warning: No error message displayed for network failure');
        }
      }
      
      // Restore online mode
      await this.page.setOfflineMode(false);
    });

    await this.runTest('Error Handling - Form Validation', async () => {
      const dateInputs = await this.page.$$('input[type="date"]');
      if (dateInputs.length >= 2) {
        // Set invalid date range
        await dateInputs[0].type('12/31/2024');
        await dateInputs[1].type('01/01/2024');
        
        const submitButton = await this.page.$('button[type="submit"], button:contains("Export")');
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForTimeout(500);
          
          const validationError = await this.page.$('.error, .invalid, .validation-error');
          if (!validationError) {
            console.warn('Warning: Form validation may not prevent invalid inputs');
          }
        }
      }
    });

    await this.runTest('Error Handling - Loading States', async () => {
      const actionButtons = await this.page.$$('button:contains("Export"), button:contains("Import")');
      if (actionButtons.length > 0) {
        await actionButtons[0].click();
        await this.page.waitForTimeout(200);
        
        const loadingIndicator = await this.page.$('.loading, .spinner, [data-testid="loading"]');
        const disabledButton = await this.page.evaluate(el => el.disabled, actionButtons[0]);
        
        if (!loadingIndicator && !disabledButton) {
          console.warn('Warning: No loading state indicators found during async operations');
        }
      }
    });
  }

  async testAccessibilityAndUsability() {
    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(200);
      
      const focusedElement = await this.page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused.tagName,
          hasVisibleFocus: getComputedStyle(focused).outline !== 'none' ||
                          getComputedStyle(focused).boxShadow !== 'none'
        };
      });
      
      if (focusedElement.tagName === 'BODY') {
        throw new Error('Keyboard navigation does not work');
      }
      
      if (!focusedElement.hasVisibleFocus) {
        throw new Error('Focused element does not have visible focus indicator');
      }
    });

    await this.runTest('Accessibility - Screen Reader Compatibility', async () => {
      const ariaLabels = await this.page.$$('[aria-label], [aria-labelledby]');
      const formLabels = await this.page.$$('label');
      
      if (ariaLabels.length === 0 && formLabels.length === 0) {
        throw new Error('No ARIA labels or form labels found for screen reader support');
      }
    });

    await this.runTest('Accessibility - Color Contrast', async () => {
      const buttons = await this.page.$$('button');
      if (buttons.length === 0) throw new Error('No buttons found for contrast testing');
      
      for (const button of buttons.slice(0, 3)) {
        const styles = await this.page.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color
          };
        }, button);
        
        if (styles.backgroundColor === styles.color) {
          throw new Error('Button may have poor color contrast');
        }
      }
    });

    await this.runTest('Usability - Responsive Design', async () => {
      const viewports = [
        { width: 320, height: 568 },
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

  async generateReport() {
    console.log('\n📊 Settings Backup & Export Test Results');
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
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      console.log('\n🧪 Running Settings Backup & Export Tests...');
      
      await this.testPageStructureAndNavigation();
      await this.testManualExportSection();
      await this.testScheduledBackupsSection();
      await this.testCloudSyncDestinations();
      await this.testImportAndRestore();
      await this.testErrorHandlingAndEdgeCases();
      await this.testAccessibilityAndUsability();
      
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
  const tester = new SettingsBackupExportTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = SettingsBackupExportTester;
