// Enhanced Background script for BookAIMark AI Bookmark Assistant
// Handles AI-powered bookmark management, suggestions, and analytics

const APP_ORIGIN = 'http://localhost:3000';
const API_BASE = `${APP_ORIGIN}/api`;

interface BookmarkData {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  content?: string;
  timestamp: number;
  aiSuggestions?: {
    category: string;
    tags: string[];
    priority: 'high' | 'medium' | 'low';
    confidence: number;
  };
}

interface AIAnalysisResult {
  category: string;
  tags: string[];
  summary: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  readingTime: number;
}

interface ExtensionSettings {
  autoSave: boolean;
  aiCategorization: boolean;
  realTimeSuggestions: boolean;
  duplicateDetection: boolean;
  syncEnabled: boolean;
}

// Default settings
let settings: ExtensionSettings = {
  autoSave: false,
  aiCategorization: true,
  realTimeSuggestions: true,
  duplicateDetection: true,
  syncEnabled: true
};

// Analytics tracking
let analyticsData = {
  bookmarksSaved: 0,
  suggestionsShown: 0,
  suggestionsAccepted: 0,
  categoriesUsed: new Set<string>(),
  lastSync: 0
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('BookAIMark AI Assistant installed');
    
    // Load settings
    await loadSettings();
    
    // Create context menus
    await createContextMenus();
    
    // Open welcome page
    chrome.tabs.create({
      url: `${APP_ORIGIN}/settings/ai/browser-extension`
    });
  } else if (details.reason === 'update') {
    console.log('BookAIMark AI Assistant updated');
    await loadSettings();
    await createContextMenus();
  }
});

// Load settings from storage
async function loadSettings(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get('bookaimark_settings');
    if (result.bookaimark_settings) {
      settings = { ...settings, ...result.bookaimark_settings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save settings to storage
async function saveSettings(): Promise<void> {
  try {
    await chrome.storage.sync.set({ bookaimark_settings: settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Create context menus
async function createContextMenus(): Promise<void> {
  try {
    // Remove existing menus
    await chrome.contextMenus.removeAll();
    
    // Add bookmark with AI categorization
    chrome.contextMenus.create({
      id: 'save-bookmark-ai',
      title: 'Save to BookAIMark with AI',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Quick save without AI
    chrome.contextMenus.create({
      id: 'save-bookmark-quick',
      title: 'Quick Save to BookAIMark',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Separator
    chrome.contextMenus.create({
      id: 'separator1',
      type: 'separator',
      contexts: ['page', 'link']
    });
    
    // Search similar bookmarks
    chrome.contextMenus.create({
      id: 'search-similar',
      title: 'Find Similar Bookmarks',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
  } catch (error) {
    console.error('Failed to create context menus:', error);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  const url = info.linkUrl || info.pageUrl || tab.url;
  const title = tab.title;
  
  if (!url) return;
  
  switch (info.menuItemId) {
    case 'save-bookmark-ai':
      await saveBookmarkWithAI(url, title, tab.id);
      break;
    case 'save-bookmark-quick':
      await saveBookmarkQuick(url, title);
      break;
    case 'search-similar':
      await searchSimilarBookmarks(url);
      break;
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !tab?.id) return;
  
  switch (command) {
    case 'save-bookmark':
      await saveBookmarkWithAI(tab.url, tab.title, tab.id);
      break;
    case 'quick-search':
      await openQuickSearch();
      break;
  }
});

// Handle tab updates for real-time suggestions
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && settings.realTimeSuggestions) {
    await checkForSuggestions(tab.url, tab.title, tabId);
  }
});

// Save bookmark with AI analysis
async function saveBookmarkWithAI(url: string, title?: string, tabId?: number): Promise<void> {
  try {
    // Extract page content if we have tab access
    let content = '';
    if (tabId) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: extractPageContent
        });
        content = results[0]?.result || '';
      } catch (error) {
        console.warn('Could not extract page content:', error);
      }
    }
    
    // Prepare bookmark data
    const bookmarkData: BookmarkData = {
      url,
      title: title || 'Untitled',
      content: content.substring(0, 5000), // Limit content size
      timestamp: Date.now()
    };
    
    // Get AI analysis
    if (settings.aiCategorization) {
      const aiAnalysis = await getAIAnalysis(bookmarkData);
      bookmarkData.aiSuggestions = {
        category: aiAnalysis.category,
        tags: aiAnalysis.tags,
        priority: aiAnalysis.priority,
        confidence: aiAnalysis.confidence
      };
    }
    
    // Save bookmark
    await saveBookmark(bookmarkData);
    
    // Show success notification
    await showNotification('Bookmark saved with AI categorization!', 'success');
    
    // Update analytics
    analyticsData.bookmarksSaved++;
    if (bookmarkData.aiSuggestions) {
      analyticsData.categoriesUsed.add(bookmarkData.aiSuggestions.category);
    }
    
  } catch (error) {
    console.error('Failed to save bookmark with AI:', error);
    await showNotification('Failed to save bookmark', 'error');
  }
}

// Quick save without AI
async function saveBookmarkQuick(url: string, title?: string): Promise<void> {
  try {
    const bookmarkData: BookmarkData = {
      url,
      title: title || 'Untitled',
      timestamp: Date.now()
    };
    
    await saveBookmark(bookmarkData);
    await showNotification('Bookmark saved!', 'success');
    analyticsData.bookmarksSaved++;
    
  } catch (error) {
    console.error('Failed to save bookmark:', error);
    await showNotification('Failed to save bookmark', 'error');
  }
}

// Extract page content for AI analysis
function extractPageContent(): string {
  // Remove scripts, styles, and other non-content elements
  const elementsToRemove = ['script', 'style', 'nav', 'header', 'footer', 'aside'];
  elementsToRemove.forEach(tag => {
    const elements = document.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
  });
  
  // Get main content
  const content = document.body?.innerText || document.textContent || '';
  
  // Clean up whitespace
  return content.replace(/\s+/g, ' ').trim();
}

// Get AI analysis for bookmark
async function getAIAnalysis(bookmarkData: BookmarkData): Promise<AIAnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/ai/content-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: bookmarkData.url,
        title: bookmarkData.title,
        content: bookmarkData.content
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.analysis;
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Fallback: basic categorization
    return {
      category: categorizeByDomain(bookmarkData.url),
      tags: extractBasicTags(bookmarkData.title || ''),
      summary: bookmarkData.title || 'No summary available',
      priority: 'medium',
      confidence: 0.5,
      sentiment: 'neutral',
      readingTime: Math.ceil((bookmarkData.content?.length || 0) / 200)
    };
  }
}

// Basic domain-based categorization fallback
function categorizeByDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('github.com')) return 'development';
    if (domain.includes('stackoverflow.com')) return 'development';
    if (domain.includes('youtube.com')) return 'entertainment';
    if (domain.includes('wikipedia.org')) return 'reference';
    if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) return 'news';
    if (domain.includes('medium.com') || domain.includes('blog')) return 'articles';
    if (domain.includes('amazon.com') || domain.includes('shop')) return 'shopping';
    
    return 'general';
  } catch {
    return 'general';
  }
}

// Extract basic tags from title
function extractBasicTags(title: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = title.toLowerCase().split(/\s+/).filter(word => 
    word.length > 2 && !commonWords.has(word)
  );
  return words.slice(0, 3);
}

// Save bookmark to backend
async function saveBookmark(bookmarkData: BookmarkData): Promise<void> {
  const response = await fetch(`${API_BASE}/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: bookmarkData.url,
      title: bookmarkData.title,
      description: bookmarkData.description,
      category: bookmarkData.aiSuggestions?.category || 'general',
      tags: bookmarkData.aiSuggestions?.tags || [],
      ai_summary: bookmarkData.aiSuggestions ? 'AI categorized' : undefined,
      ai_tags: bookmarkData.aiSuggestions?.tags || [],
      ai_category: bookmarkData.aiSuggestions?.category,
      source: 'browser_extension'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save bookmark: ${response.status}`);
  }
}

// Check for real-time suggestions
async function checkForSuggestions(url: string, title?: string, tabId?: number): Promise<void> {
  if (!settings.realTimeSuggestions) return;
  
  try {
    // Check if similar bookmarks exist
    const response = await fetch(`${API_BASE}/bookmarks/similar?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.similar && data.similar.length > 0) {
        await showSuggestionNotification(data.similar, url, tabId);
        analyticsData.suggestionsShown++;
      }
    }
  } catch (error) {
    console.error('Failed to check suggestions:', error);
  }
}

// Show suggestion notification
async function showSuggestionNotification(similarBookmarks: any[], url: string, tabId?: number): Promise<void> {
  if (tabId) {
    // Inject suggestion overlay
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: showSuggestionOverlay,
        args: [similarBookmarks, url]
      });
    } catch (error) {
      console.warn('Could not show suggestion overlay:', error);
    }
  }
}

// Show suggestion overlay (injected into page)
function showSuggestionOverlay(similarBookmarks: any[], currentUrl: string): void {
  // Remove existing overlay
  const existing = document.getElementById('bookaimark-suggestion-overlay');
  if (existing) existing.remove();
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'bookaimark-suggestion-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #333;
  `;
  
  overlay.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e1e5e9;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 12px;">📚</span>
          </div>
          <span style="font-weight: 600; color: #1f2937;">BookAIMark</span>
        </div>
        <button id="close-suggestion" style="background: none; border: none; cursor: pointer; color: #6b7280; font-size: 18px;">&times;</button>
      </div>
      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">Similar bookmarks found</p>
    </div>
    <div style="padding: 16px;">
      <div style="margin-bottom: 12px;">
        ${similarBookmarks.slice(0, 3).map(bookmark => `
          <div style="padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
            <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${bookmark.title}</div>
            <div style="font-size: 12px; color: #6b7280;">${bookmark.url}</div>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="save-anyway" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">Save Anyway</button>
        <button id="view-similar" style="flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">View Similar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('close-suggestion')?.addEventListener('click', () => {
    overlay.remove();
  });
  
  document.getElementById('save-anyway')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'save_bookmark', url: currentUrl });
    overlay.remove();
  });
  
  document.getElementById('view-similar')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'open_similar', bookmarks: similarBookmarks });
    overlay.remove();
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 10000);
}

// Search similar bookmarks
async function searchSimilarBookmarks(url: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/bookmarks/similar?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      
      // Open search results in BookAIMark
      chrome.tabs.create({
        url: `${APP_ORIGIN}/search?similar=${encodeURIComponent(url)}`
      });
    }
  } catch (error) {
    console.error('Failed to search similar bookmarks:', error);
  }
}

// Open quick search
async function openQuickSearch(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showQuickSearchOverlay
      });
    }
  } catch (error) {
    console.error('Failed to open quick search:', error);
  }
}

// Show quick search overlay
function showQuickSearchOverlay(): void {
  // Implementation for quick search overlay
  console.log('Quick search overlay would be shown here');
}

// Show notification
async function showNotification(message: string, type: 'success' | 'error'): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showToast,
        args: [message, type]
      });
    }
  } catch (error) {
    console.warn('Could not show notification:', error);
  }
}

// Show toast notification (injected into page)
function showToast(message: string, type: 'success' | 'error'): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.type) {
    case 'capture_tabs':
      await captureTabs();
      sendResponse({ success: true });
      break;
    case 'save_bookmark':
      await saveBookmarkWithAI(message.url, message.title, sender.tab?.id);
      sendResponse({ success: true });
      break;
    case 'get_settings':
      sendResponse({ settings });
      break;
    case 'update_settings':
      settings = { ...settings, ...message.settings };
      await saveSettings();
      sendResponse({ success: true });
      break;
    case 'get_analytics':
      sendResponse({ analytics: analyticsData });
      break;
    case 'open_similar':
      chrome.tabs.create({
        url: `${APP_ORIGIN}/search?bookmarks=${encodeURIComponent(JSON.stringify(message.bookmarks))}`
      });
      break;
  }
});

// Legacy tab capture function (for backward compatibility)
async function captureTabs(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const validTabs = tabs
      .filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
      .slice(0, 40);

    if (validTabs.length === 0) {
      console.warn('No valid tabs found to capture');
      return;
    }

    // Save each tab as a bookmark with AI analysis
    for (const tab of validTabs) {
      if (tab.url && tab.title) {
        await saveBookmarkWithAI(tab.url, tab.title, tab.id);
      }
    }

    await showNotification(`Captured ${validTabs.length} tabs with AI categorization!`, 'success');
    
  } catch (error) {
    console.error('Failed to capture tabs:', error);
    await showNotification('Failed to capture tabs', 'error');
  }
}

// Sync analytics periodically
setInterval(async () => {
  if (settings.syncEnabled && Date.now() - analyticsData.lastSync > 300000) { // 5 minutes
    try {
      await fetch(`${API_BASE}/analytics/extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      analyticsData.lastSync = Date.now();
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    }
  }
}, 60000); // Check every minute

export {}; 