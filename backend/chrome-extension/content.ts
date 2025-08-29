// Enhanced Content script for BookAIMark AI Bookmark Assistant
// Handles page interaction, real-time suggestions, and overlay features

interface SuggestionData {
  similar: Array<{
    id: string;
    title: string;
    url: string;
    category: string;
    tags: string[];
  }>;
  confidence: number;
  reason: string;
}

interface PageAnalysis {
  url: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  readingTime: number;
}

class ContentManager {
  private isBookAIMarkPage: boolean = false;
  private hasShownSuggestion: boolean = false;
  private pageAnalysis: PageAnalysis | null = null;
  private overlayVisible: boolean = false;

  constructor() {
    this.isBookAIMarkPage = window.location.hostname.includes('localhost') && 
                           window.location.port === '3000';
    this.init();
  }

  private init(): void {
    // Don't run on BookAIMark pages themselves
    if (this.isBookAIMarkPage) {
      this.setupBookAIMarkPageListeners();
      return;
    }

    this.setupMessageListeners();
    this.analyzePageContent();
    this.setupKeyboardShortcuts();
    this.checkForDuplicates();
    
    // Monitor page changes for SPAs
    this.observePageChanges();
  }

  private setupBookAIMarkPageListeners(): void {
    // Listen for messages from extension on BookAIMark pages
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'tabs:capture') {
        this.handleTabCapture(event.data.tabs);
      }
    });
  }

  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'show_suggestion':
          this.showSuggestionOverlay(message.suggestions);
          break;
        case 'analyze_page':
          sendResponse({ analysis: this.pageAnalysis });
          break;
        case 'get_page_content':
          sendResponse({ content: this.extractPageContent() });
          break;
        case 'show_save_confirmation':
          this.showSaveConfirmation(message.bookmark);
          break;
      }
    });
  }

  private analyzePageContent(): void {
    try {
      const content = this.extractPageContent();
      const keywords = this.extractKeywords(content);
      const category = this.categorizeContent(content, document.title);
      const readingTime = this.calculateReadingTime(content);

      this.pageAnalysis = {
        url: window.location.href,
        title: document.title,
        content: content.substring(0, 2000), // Limit content size
        keywords,
        category,
        readingTime
      };

      // Send analysis to background script for processing
      chrome.runtime.sendMessage({
        type: 'page_analyzed',
        analysis: this.pageAnalysis
      });

    } catch (error) {
      console.error('Failed to analyze page content:', error);
    }
  }

  private extractPageContent(): string {
    // Create a clone to avoid modifying the actual page
    const clone = document.cloneNode(true) as Document;
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.comments',
      '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get main content
    const mainContent = clone.querySelector('main, article, .content, #content, .post, .article');
    const content = mainContent?.textContent || clone.body?.textContent || '';
    
    // Clean up whitespace
    return content.replace(/\s+/g, ' ').trim();
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private categorizeContent(content: string, title: string): string {
    const text = (content + ' ' + title).toLowerCase();
    
    const categories = {
      'development': ['code', 'programming', 'developer', 'api', 'javascript', 'python', 'react', 'github'],
      'design': ['design', 'ui', 'ux', 'interface', 'figma', 'adobe', 'creative', 'visual'],
      'business': ['business', 'startup', 'entrepreneur', 'marketing', 'sales', 'finance', 'strategy'],
      'technology': ['technology', 'tech', 'software', 'hardware', 'computer', 'innovation'],
      'education': ['learn', 'tutorial', 'course', 'education', 'training', 'guide', 'how to'],
      'news': ['news', 'breaking', 'report', 'journalism', 'current', 'politics', 'world'],
      'entertainment': ['entertainment', 'movie', 'music', 'game', 'fun', 'video', 'streaming'],
      'health': ['health', 'medical', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition'],
      'science': ['science', 'research', 'study', 'discovery', 'experiment', 'academic'],
      'sports': ['sport', 'football', 'basketball', 'soccer', 'athlete', 'game', 'match']
    };
    
    let bestCategory = 'general';
    let maxScore = 0;
    
    Object.entries(categories).forEach(([category, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        return sum + matches;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });
    
    return bestCategory;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + Shift + S - Save bookmark
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        this.saveCurrentPage();
      }
      
      // Ctrl/Cmd + Shift + F - Quick search
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        this.showQuickSearch();
      }
    });
  }

  private async checkForDuplicates(): Promise<void> {
    try {
      // Wait a bit for page to fully load
      setTimeout(async () => {
        const response = await fetch(`http://localhost:3000/api/bookmarks/check-duplicate?url=${encodeURIComponent(window.location.href)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isDuplicate) {
            this.showDuplicateNotification(data.existing);
          }
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to check for duplicates:', error);
    }
  }

  private observePageChanges(): void {
    // For SPAs that change content without page reload
    const observer = new MutationObserver((mutations) => {
      let significantChange = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if significant content was added
          const addedText = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
            .map(node => node.textContent || '')
            .join(' ');
          
          if (addedText.length > 100) {
            significantChange = true;
          }
        }
      });
      
      if (significantChange) {
        // Re-analyze page after significant changes
        setTimeout(() => this.analyzePageContent(), 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });
  }

  private async saveCurrentPage(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'save_bookmark',
        url: window.location.href,
        title: document.title
      });
      
      this.showToast('Bookmark saved with AI categorization!', 'success');
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      this.showToast('Failed to save bookmark', 'error');
    }
  }

  private showQuickSearch(): void {
    this.createQuickSearchOverlay();
  }

  private createQuickSearchOverlay(): void {
    // Remove existing overlay
    const existing = document.getElementById('bookaimark-search-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'bookaimark-search-overlay';
    overlay.innerHTML = `
      <div class="bookaimark-search-backdrop">
        <div class="bookaimark-search-modal">
          <div class="bookaimark-search-header">
            <h3>Quick Search Bookmarks</h3>
            <button class="bookaimark-close-btn">&times;</button>
          </div>
          <div class="bookaimark-search-body">
            <input type="text" placeholder="Search your bookmarks..." class="bookaimark-search-input" autofocus>
            <div class="bookaimark-search-results"></div>
          </div>
        </div>
      </div>
    `;
    
    this.addSearchStyles();
    document.body.appendChild(overlay);
    
    // Setup search functionality
    this.setupSearchOverlay(overlay);
  }

  private addSearchStyles(): void {
    if (document.getElementById('bookaimark-search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'bookaimark-search-styles';
    style.textContent = `
      .bookaimark-search-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .bookaimark-search-modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .bookaimark-search-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bookaimark-search-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .bookaimark-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .bookaimark-search-body {
        padding: 20px;
      }
      
      .bookaimark-search-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .bookaimark-search-input:focus {
        border-color: #3b82f6;
      }
      
      .bookaimark-search-results {
        margin-top: 16px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .bookaimark-search-result {
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .bookaimark-search-result:hover {
        background-color: #f9fafb;
      }
      
      .bookaimark-result-title {
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .bookaimark-result-url {
        font-size: 14px;
        color: #6b7280;
      }
    `;
    
    document.head.appendChild(style);
  }

  private setupSearchOverlay(overlay: HTMLElement): void {
    const input = overlay.querySelector('.bookaimark-search-input') as HTMLInputElement;
    const results = overlay.querySelector('.bookaimark-search-results') as HTMLElement;
    const closeBtn = overlay.querySelector('.bookaimark-close-btn') as HTMLElement;
    
    // Close overlay
    const closeOverlay = () => overlay.remove();
    closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay.querySelector('.bookaimark-search-backdrop')) {
        closeOverlay();
      }
    });
    
    // Search functionality
    let searchTimeout: number;
    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        this.performSearch(input.value, results);
      }, 300);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    });
  }

  private async performSearch(query: string, resultsContainer: HTMLElement): Promise<void> {
    if (!query.trim()) {
      resultsContainer.innerHTML = '';
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/bookmarks/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        this.displaySearchResults(data.bookmarks || [], resultsContainer);
      }
    } catch (error) {
      console.error('Search failed:', error);
      resultsContainer.innerHTML = '<div class="bookaimark-search-result">Search failed. Please try again.</div>';
    }
  }

  private displaySearchResults(bookmarks: any[], container: HTMLElement): void {
    if (bookmarks.length === 0) {
      container.innerHTML = '<div class="bookaimark-search-result">No bookmarks found.</div>';
      return;
    }
    
    container.innerHTML = bookmarks.map(bookmark => `
      <div class="bookaimark-search-result" onclick="window.open('${bookmark.url}', '_blank')">
        <div class="bookaimark-result-title">${bookmark.title}</div>
        <div class="bookaimark-result-url">${bookmark.url}</div>
      </div>
    `).join('');
  }

  private showSuggestionOverlay(suggestions: SuggestionData): void {
    if (this.hasShownSuggestion || this.overlayVisible) return;
    
    this.hasShownSuggestion = true;
    this.overlayVisible = true;
    
    // Implementation from background script
    // This would show the suggestion overlay for similar bookmarks
  }

  private showDuplicateNotification(existingBookmark: any): void {
    this.showToast(`This page is already bookmarked: "${existingBookmark.title}"`, 'info', 5000);
  }

  private showSaveConfirmation(bookmark: any): void {
    this.showToast(`Saved: "${bookmark.title}"`, 'success');
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  private handleTabCapture(tabs: any[]): void {
    // Handle tab capture on BookAIMark pages
    console.log('Received tab capture:', tabs);
    
    // This would integrate with the BookAIMark UI to display captured tabs
    const event = new CustomEvent('bookaimark:tabs-captured', {
      detail: { tabs }
    });
    window.dispatchEvent(event);
  }
}

// Initialize content manager
new ContentManager();

export {}; 