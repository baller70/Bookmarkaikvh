import { test, expect } from '@playwright/test'

test.describe('AI Recommendations Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to recommendations page
    await page.goto('http://localhost:3001/settings/ai/recommendations')
    await page.waitForLoadState('networkidle')
  })

  test('should load page with correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle(/KH Jinx/)
    await expect(page.locator('h1')).toContainText('Personalized Recommendations')
    await expect(page.locator('text=AI-powered suggestions tailored to your interests')).toBeVisible()
  })

  test('should have all collapsible sections', async ({ page }) => {
    // Check all section headers are present
    await expect(page.locator('text=Recommendation Engine')).toBeVisible()
    await expect(page.locator('text=Automation')).toBeVisible()
    await expect(page.locator('text=Content Details')).toBeVisible()
    await expect(page.locator('text=Revisit Nudge')).toBeVisible()
  })

  test('should toggle collapsible sections', async ({ page }) => {
    // Test Engine section collapse/expand
    const engineSection = page.locator('text=Recommendation Engine').locator('..')
    await engineSection.click()
    // Check if content is hidden (collapsed)
    await expect(page.locator('text=Suggestions per refresh')).not.toBeVisible()
    
    // Expand again
    await engineSection.click()
    await expect(page.locator('text=Suggestions per refresh')).toBeVisible()
  })

  test('should adjust suggestions per refresh slider', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('8')
    await expect(page.locator('text=8')).toBeVisible()
  })

  test('should adjust serendipity level slider', async ({ page }) => {
    const serendipitySlider = page.locator('input[type="range"]').nth(1)
    await serendipitySlider.fill('7')
    // Verify the value changed
    await expect(serendipitySlider).toHaveValue('7')
  })

  test('should toggle automation switches', async ({ page }) => {
    // Test auto-include switch
    const autoIncludeSwitch = page.locator('text=Auto-include after selection').locator('..').locator('button')
    await autoIncludeSwitch.click()
    
    // Test auto-bundle switch  
    const autoBundleSwitch = page.locator('text=Auto-bundle accepted links').locator('..').locator('button')
    await autoBundleSwitch.click()
  })

  test('should toggle TL;DR summaries', async ({ page }) => {
    const tldrSwitch = page.locator('text=Show TL;DR summaries').locator('..').locator('button')
    await tldrSwitch.click()
  })

  test('should update domain blacklist', async ({ page }) => {
    const blacklistTextarea = page.locator('textarea[placeholder*="Enter domains to exclude"]')
    await blacklistTextarea.fill('spam.com\nexample-ads.net\nbadsite.org')
    await expect(blacklistTextarea).toHaveValue('spam.com\nexample-ads.net\nbadsite.org')
  })

  test('should adjust revisit nudge days', async ({ page }) => {
    const revisitSlider = page.locator('text=Revisit Nudge').locator('..').locator('input[type="range"]')
    await revisitSlider.fill('21')
    await expect(page.locator('text=21 days')).toBeVisible()
  })

  test('should generate recommendations', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate New Suggestions")')
    await generateButton.click()
    
    // Wait for loading state
    await expect(page.locator('text=Generating...')).toBeVisible()
    
    // Wait for recommendations to load
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Check recommendations appeared
    await expect(page.locator('text=personalized suggestions based on your preferences')).toBeVisible()
  })

  test('should show unsaved changes alert when settings change', async ({ page }) => {
    // Make a change
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('9')
    
    // Check unsaved changes alert appears
    await expect(page.locator('text=You have unsaved changes')).toBeVisible()
    await expect(page.locator('button:has-text("Reset")')).toBeVisible()
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible()
  })

  test('should reset changes', async ({ page }) => {
    // Make a change
    const slider = page.locator('input[type="range"]').first()
    const originalValue = await slider.inputValue()
    await slider.fill('9')
    
    // Reset changes
    await page.locator('button:has-text("Reset")').click()
    
    // Verify value returned to original
    await expect(slider).toHaveValue(originalValue)
    await expect(page.locator('text=You have unsaved changes')).not.toBeVisible()
  })

  test('should save changes', async ({ page }) => {
    // Make a change
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('7')
    
    // Save changes
    await page.locator('button:has-text("Save Changes")').click()
    
    // Check for success toast (may need to wait)
    await expect(page.locator('text=saved successfully')).toBeVisible({ timeout: 5000 })
  })

  test('should select and deselect recommendations', async ({ page }) => {
    // Generate recommendations first
    await page.locator('button:has-text("Generate New Suggestions")').click()
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Select first recommendation
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    await firstCheckbox.check()
    
    // Verify batch toolbar appears
    await expect(page.locator('text=1 selected')).toBeVisible()
    await expect(page.locator('button:has-text("Add Selected")')).toBeVisible()
    
    // Deselect
    await firstCheckbox.uncheck()
    await expect(page.locator('text=1 selected')).not.toBeVisible()
  })

  test('should test recommendation feedback buttons', async ({ page }) => {
    // Generate recommendations first
    await page.locator('button:has-text("Generate New Suggestions")').click()
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Click thumbs up on first recommendation
    const thumbsUpButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await thumbsUpButton.click()
    
    // Check for feedback toast
    await expect(page.locator('text=Feedback recorded')).toBeVisible({ timeout: 3000 })
  })

  test('should show recommendation details in tooltip', async ({ page }) => {
    // Generate recommendations first
    await page.locator('button:has-text("Generate New Suggestions")').click()
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Hover over info icon to show tooltip
    const infoIcon = page.locator('svg').filter({ hasText: '' }).first()
    await infoIcon.hover()
    
    // Check tooltip content
    await expect(page.locator('text=Why this link?')).toBeVisible()
  })

  test('should test auto-include functionality', async ({ page }) => {
    // Enable auto-include
    const autoIncludeSwitch = page.locator('text=Auto-include after selection').locator('..').locator('button')
    await autoIncludeSwitch.click()
    
    // Generate recommendations
    await page.locator('button:has-text("Generate New Suggestions")').click()
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Select a recommendation
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    await firstCheckbox.check()
    
    // Wait for auto-include (500ms delay)
    await expect(page.locator('text=new bookmark')).toBeVisible({ timeout: 2000 })
  })

  test('should add selected recommendations to bookmarks', async ({ page }) => {
    // Generate recommendations
    await page.locator('button:has-text("Generate New Suggestions")').click()
    await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 10000 })
    
    // Select multiple recommendations
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.first().check()
    await checkboxes.nth(1).check()
    
    // Click Add Selected
    await page.locator('button:has-text("Add Selected")').click()
    
    // Check success message
    await expect(page.locator('text=bookmarks added')).toBeVisible({ timeout: 3000 })
  })

  test('should toggle trending links', async ({ page }) => {
    const trendingSwitch = page.locator('text=Include trending links').locator('..').locator('button')
    await trendingSwitch.click()
    
    // Verify switch state changed
    await expect(trendingSwitch).toHaveAttribute('data-state', 'checked')
  })
}) 