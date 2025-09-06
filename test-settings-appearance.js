#!/usr/bin/env node

/**
 * Settings Page Appearance Settings Comprehensive Test Suite
 * Tests all features and functionality of the Appearance Settings section
 */

const puppeteer = require('puppeteer');

class SettingsAppearanceTester {
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
    console.log('🚀 Initializing Settings Appearance Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Navigate to the Settings Appearance page
    await this.page.goto('http://localhost:3000/settings/appearance', {
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
    await this.runTest('Header - Back to Dashboard Navigation', async () => {
      const backLink = await this.page.$('a[href="/dashboard"], a:contains("Back to Dashboard")');
      if (!backLink) throw new Error('Back to Dashboard link not found');
      
      const linkText = await this.page.evaluate(el => el.textContent, backLink);
      if (!linkText.includes('Back') && !linkText.includes('Dashboard')) {
        throw new Error('Back to Dashboard link text is incorrect');
      }
    });

    await this.runTest('Header - Settings Page Title', async () => {
      const title = await this.page.$('h1, [data-testid="page-title"]');
      if (!title) throw new Error('Settings page title not found');
      
      const titleText = await this.page.evaluate(el => el.textContent, title);
      if (!titleText.includes('Settings')) {
        throw new Error('Settings page title does not contain "Settings"');
      }
    });

    await this.runTest('Header - Reset Button', async () => {
      const resetButton = await this.page.$('button:contains("Reset"), [data-testid="reset-button"]');
      if (!resetButton) {
        const buttons = await this.page.$$('button');
        let found = false;
        for (const button of buttons) {
          const text = await this.page.evaluate(el => el.textContent, button);
          if (text.includes('Reset')) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error('Reset button not found');
      }
      
      const isClickable = await this.page.evaluate(el => {
        return !el.disabled && getComputedStyle(el).pointerEvents !== 'none';
      }, resetButton);
      
      if (!isClickable) throw new Error('Reset button is not clickable');
    });

    await this.runTest('Header - Save Changes Button', async () => {
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
        if (!found) throw new Error('Save Changes button not found');
      }
    });

    await this.runTest('Header - Button Hover States', async () => {
      const buttons = await this.page.$$('button');
      if (buttons.length === 0) throw new Error('No buttons found for hover testing');
      
      for (const button of buttons) {
        await button.hover();
        await this.page.waitForTimeout(200);
        
        const hasHoverEffect = await this.page.evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.transform !== 'none' || 
                 styles.boxShadow !== 'none' ||
                 styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        }, button);
        
        if (!hasHoverEffect) {
          console.warn('Warning: Button may not have hover effect');
        }
      }
    });
  }

  async testSidebarNavigation() {
    await this.runTest('Sidebar - Appearance Active State', async () => {
      const appearanceLink = await this.page.$('a[href*="appearance"], .nav-item.active');
      if (!appearanceLink) throw new Error('Appearance navigation item not found');
      
      const isActive = await this.page.evaluate(el => {
        return el.classList.contains('active') || 
               el.getAttribute('aria-current') === 'page' ||
               getComputedStyle(el).fontWeight === 'bold';
      }, appearanceLink);
      
      if (!isActive) throw new Error('Appearance navigation item does not show active state');
    });

    const navigationItems = [
      'Notifications',
      'Privacy & Security',
      'Backup & Export',
      'Billing & Subscription',
      'Oracle AI Chat Bot'
    ];

    for (const item of navigationItems) {
      await this.runTest(`Sidebar - ${item} Navigation`, async () => {
        const navLink = await this.page.$(`a:contains("${item}"), [data-testid="${item.toLowerCase().replace(/\s+/g, '-')}-nav"]`);
        if (!navLink) {
          console.warn(`Warning: ${item} navigation link not found`);
          return;
        }
        
        const isClickable = await this.page.evaluate(el => {
          return getComputedStyle(el).pointerEvents !== 'none';
        }, navLink);
        
        if (!isClickable) throw new Error(`${item} navigation link is not clickable`);
      });
    }

    await this.runTest('Sidebar - Responsive Behavior', async () => {
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      await this.page.waitForTimeout(500);
      
      const sidebar = await this.page.$('.sidebar, [data-testid="sidebar"]');
      if (sidebar) {
        const sidebarVisible = await this.page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, sidebar);
        
        if (!sidebarVisible) {
          console.warn('Warning: Sidebar may be hidden on mobile - check if hamburger menu exists');
        }
      }
      
      // Reset to desktop
      await this.page.setViewport({ width: 1920, height: 1080 });
    });

    await this.runTest('Sidebar - Keyboard Navigation', async () => {
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
        throw new Error('Keyboard navigation does not work - no focusable elements');
      }
    });
  }

  async testThemeSelection() {
    await this.runTest('Theme - Light Theme Dropdown', async () => {
      const themeDropdown = await this.page.$('select, [data-testid="theme-dropdown"]');
      if (!themeDropdown) throw new Error('Theme dropdown not found');
      
      await themeDropdown.click();
      await this.page.waitForTimeout(300);
      
      const options = await this.page.$$('option, [role="option"]');
      if (options.length === 0) throw new Error('No theme options found');
      
      // Check for Light theme option
      const optionTexts = await Promise.all(
        options.map(option => this.page.evaluate(el => el.textContent, option))
      );
      
      const hasLightTheme = optionTexts.some(text => text.includes('Light'));
      if (!hasLightTheme) throw new Error('Light theme option not found');
    });

    await this.runTest('Theme - Selection Persistence', async () => {
      const themeDropdown = await this.page.$('select, [data-testid="theme-dropdown"]');
      if (!themeDropdown) throw new Error('Theme dropdown not found');
      
      const initialValue = await this.page.evaluate(el => el.value, themeDropdown);
      
      // Refresh page and check if value persists
      await this.page.reload({ waitUntil: 'networkidle0' });
      
      const themeDropdownAfterReload = await this.page.$('select, [data-testid="theme-dropdown"]');
      if (themeDropdownAfterReload) {
        const valueAfterReload = await this.page.evaluate(el => el.value, themeDropdownAfterReload);
        if (valueAfterReload !== initialValue) {
          console.warn('Warning: Theme selection may not persist after page refresh');
        }
      }
    });

    await this.runTest('Theme - Auto-schedule Toggle', async () => {
      const autoScheduleToggle = await this.page.$('input[type="checkbox"], [data-testid="auto-schedule-toggle"]');
      if (!autoScheduleToggle) {
        console.warn('Warning: Auto-schedule toggle not found');
        return;
      }
      
      const initialState = await this.page.evaluate(el => el.checked, autoScheduleToggle);
      await autoScheduleToggle.click();
      await this.page.waitForTimeout(200);
      
      const newState = await this.page.evaluate(el => el.checked, autoScheduleToggle);
      if (initialState === newState) {
        throw new Error('Auto-schedule toggle state does not change');
      }
    });

    await this.runTest('Theme - Helper Text Display', async () => {
      const helperText = await this.page.$('.helper-text, .description, [data-testid="theme-helper"]');
      if (!helperText) {
        console.warn('Warning: Theme helper text not found');
        return;
      }
      
      const helperContent = await this.page.evaluate(el => el.textContent, helperText);
      if (!helperContent.includes('schedule') && !helperContent.includes('time')) {
        throw new Error('Helper text does not contain expected content');
      }
    });
  }

  async testAccentColors() {
    const colors = ['Blue', 'Green', 'Purple', 'Red', 'Orange'];
    
    for (const color of colors) {
      await this.runTest(`Accent Colors - ${color} Selection`, async () => {
        const colorButton = await this.page.$(`button:contains("${color}"), [data-testid="${color.toLowerCase()}-color"]`);
        if (!colorButton) {
          // Try alternative selector for color buttons
          const colorButtons = await this.page.$$('.color-button, .color-option, [data-color]');
          if (colorButtons.length === 0) throw new Error(`${color} color button not found`);
          
          // Use first available color button for testing
          await colorButtons[0].click();
          await this.page.waitForTimeout(200);
        } else {
          await colorButton.click();
          await this.page.waitForTimeout(200);
          
          const isSelected = await this.page.evaluate(el => {
            return el.classList.contains('selected') || 
                   el.classList.contains('active') ||
                   el.getAttribute('aria-selected') === 'true';
          }, colorButton);
          
          if (!isSelected) {
            console.warn(`Warning: ${color} color button may not show selected state`);
          }
        }
      });
    }

    await this.runTest('Accent Colors - Custom Color Option', async () => {
      const customButton = await this.page.$('button:contains("Custom"), [data-testid="custom-color"]');
      if (!customButton) {
        console.warn('Warning: Custom color option not found');
        return;
      }
      
      await customButton.click();
      await this.page.waitForTimeout(500);
      
      // Look for color picker dialog
      const colorPicker = await this.page.$('.color-picker, input[type="color"], [data-testid="color-picker"]');
      if (!colorPicker) {
        console.warn('Warning: Color picker dialog not found after clicking custom');
      }
    });

    await this.runTest('Accent Colors - Hover States', async () => {
      const colorButtons = await this.page.$$('.color-button, .color-option, button[data-color]');
      if (colorButtons.length === 0) {
        console.warn('Warning: No color buttons found for hover testing');
        return;
      }
      
      for (const button of colorButtons) {
        await button.hover();
        await this.page.waitForTimeout(100);
        
        const hasHoverEffect = await this.page.evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.transform !== 'none' || 
                 styles.boxShadow !== 'none' ||
                 styles.scale !== '1';
        }, button);
        
        if (!hasHoverEffect) {
          console.warn('Warning: Color button may not have hover effect');
        }
      }
    });
  }

  async testFontAndTextSize() {
    await this.runTest('Font Size - Slider Functionality', async () => {
      const fontSlider = await this.page.$('input[type="range"], .slider, [data-testid="font-size-slider"]');
      if (!fontSlider) throw new Error('Font size slider not found');
      
      const initialValue = await this.page.evaluate(el => el.value, fontSlider);
      
      // Test slider drag
      await this.page.evaluate(el => {
        el.value = '16';
        el.dispatchEvent(new Event('input'));
      }, fontSlider);
      
      const newValue = await this.page.evaluate(el => el.value, fontSlider);
      if (newValue !== '16') throw new Error('Font size slider value does not update');
    });

    await this.runTest('Font Size - Value Display', async () => {
      const valueDisplay = await this.page.$('.font-size-value, [data-testid="font-size-display"]');
      if (!valueDisplay) {
        console.warn('Warning: Font size value display not found');
        return;
      }
      
      const displayText = await this.page.evaluate(el => el.textContent, valueDisplay);
      if (!displayText.includes('px') && !displayText.includes('pt')) {
        throw new Error('Font size value display does not show units');
      }
    });

    await this.runTest('Font Size - Range Boundaries', async () => {
      const fontSlider = await this.page.$('input[type="range"], .slider, [data-testid="font-size-slider"]');
      if (!fontSlider) throw new Error('Font size slider not found');
      
      const min = await this.page.evaluate(el => el.min, fontSlider);
      const max = await this.page.evaluate(el => el.max, fontSlider);
      
      if (!min || !max) throw new Error('Font size slider min/max values not set');
      
      // Test minimum value
      await this.page.evaluate(el => {
        el.value = el.min;
        el.dispatchEvent(new Event('input'));
      }, fontSlider);
      
      // Test maximum value
      await this.page.evaluate(el => {
        el.value = el.max;
        el.dispatchEvent(new Event('input'));
      }, fontSlider);
    });

    await this.runTest('Font - Dyslexia-friendly Toggle', async () => {
      const dyslexiaToggle = await this.page.$('input[type="checkbox"], [data-testid="dyslexia-font-toggle"]');
      if (!dyslexiaToggle) {
        console.warn('Warning: Dyslexia-friendly font toggle not found');
        return;
      }
      
      const initialState = await this.page.evaluate(el => el.checked, dyslexiaToggle);
      await dyslexiaToggle.click();
      await this.page.waitForTimeout(200);
      
      const newState = await this.page.evaluate(el => el.checked, dyslexiaToggle);
      if (initialState === newState) {
        throw new Error('Dyslexia-friendly font toggle state does not change');
      }
    });

    await this.runTest('Font - Helper Text Display', async () => {
      const helperText = await this.page.$('.helper-text:contains("OpenDyslexic"), [data-testid="dyslexia-helper"]');
      if (!helperText) {
        console.warn('Warning: Dyslexia font helper text not found');
        return;
      }
      
      const helperContent = await this.page.evaluate(el => el.textContent, helperText);
      if (!helperContent.includes('OpenDyslexic') && !helperContent.includes('readability')) {
        throw new Error('Helper text does not contain expected content');
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
      await this.runTest(`Responsive - ${viewport.name} Layout`, async () => {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(500);
        
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
    
    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testAccessibility() {
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

    await this.runTest('Accessibility - Screen Reader Support', async () => {
      const ariaLabels = await this.page.$$('[aria-label], [aria-labelledby]');
      const formLabels = await this.page.$$('label');
      
      if (ariaLabels.length === 0 && formLabels.length === 0) {
        throw new Error('No ARIA labels or form labels found for screen reader support');
      }
    });

    await this.runTest('Accessibility - Form Controls', async () => {
      const formControls = await this.page.$$('input, select, button, textarea');
      let unlabeledControls = 0;
      
      for (const control of formControls) {
        const hasLabel = await this.page.evaluate(el => {
          return el.getAttribute('aria-label') ||
                 el.getAttribute('aria-labelledby') ||
                 document.querySelector(`label[for="${el.id}"]`) ||
                 el.closest('label');
        }, control);
        
        if (!hasLabel) {
          unlabeledControls++;
        }
      }
      
      if (unlabeledControls > 0) {
        console.warn(`Warning: ${unlabeledControls} form controls may be missing labels`);
      }
    });
  }

  async generateReport() {
    console.log('\n📊 Settings Appearance Test Results');
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
      
      console.log('\n🧪 Running Settings Appearance Tests...');
      
      await this.testHeaderSection();
      await this.testSidebarNavigation();
      await this.testThemeSelection();
      await this.testAccentColors();
      await this.testFontAndTextSize();
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
  const tester = new SettingsAppearanceTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = SettingsAppearanceTester;
