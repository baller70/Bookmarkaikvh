// Enhanced Popup script for BookAIMark AI Bookmark Assistant
// Handles AI features, settings, and analytics

interface ExtensionSettings {
  autoSave: boolean;
  aiCategorization: boolean;
  realTimeSuggestions: boolean;
  duplicateDetection: boolean;
  syncEnabled: boolean;
}

interface AnalyticsData {
  bookmarksSaved: number;
  suggestionsShown: number;
  suggestionsAccepted: number;
  categoriesUsed: Set<string>;
  lastSync: number;
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

class PopupManager {
  private currentTab: chrome.tabs.Tab | null = null;
  private settings: ExtensionSettings = {
    autoSave: false,
    aiCategorization: true,
    realTimeSuggestions: true,
    duplicateDetection: true,
    syncEnabled: true
  };
  private analytics: AnalyticsData = {
    bookmarksSaved: 0,
    suggestionsShown: 0,
    suggestionsAccepted: 0,
    categoriesUsed: new Set(),
    lastSync: 0
  };

  async init() {
    await this.loadCurrentTab();
    await this.loadSettings();
    await this.loadAnalytics();
    this.setupEventListeners();
    this.updateUI();
    await this.getAISuggestions();
  }

  private async loadCurrentTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      this.updatePageInfo();
    } catch (error) {
      console.error('Failed to load current tab:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const response = await this.sendMessage({ type: 'get_settings' });
      if (response?.settings) {
        this.settings = response.settings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const response = await this.sendMessage({ type: 'get_analytics' });
      if (response?.analytics) {
        this.analytics = response.analytics;
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  private setupEventListeners(): void {
    // Action buttons
    document.getElementById('saveCurrentBtn')?.addEventListener('click', () => this.saveCurrentPage(true));
    document.getElementById('quickSaveBtn')?.addEventListener('click', () => this.saveCurrentPage(false));
    document.getElementById('captureTabsBtn')?.addEventListener('click', () => this.captureTabs());
    document.getElementById('searchBtn')?.addEventListener('click', () => this.openSearch());
    document.getElementById('openDashboard')?.addEventListener('click', () => this.openDashboard());

    // Settings toggles
    document.getElementById('aiToggle')?.addEventListener('click', () => this.toggleSetting('aiCategorization'));
    document.getElementById('suggestionsToggle')?.addEventListener('click', () => this.toggleSetting('realTimeSuggestions'));
    document.getElementById('autoSaveToggle')?.addEventListener('click', () => this.toggleSetting('autoSave'));
  }

  private updatePageInfo(): void {
    if (!this.currentTab) return;

    const titleEl = document.getElementById('pageTitle');
    const urlEl = document.getElementById('pageUrl');
    const faviconEl = document.getElementById('pageFavicon');

    if (titleEl) titleEl.textContent = this.currentTab.title || 'Untitled';
    if (urlEl) urlEl.textContent = this.currentTab.url || '';
    
    if (faviconEl && this.currentTab.favIconUrl) {
      faviconEl.innerHTML = `<img src="${this.currentTab.favIconUrl}" style="width: 100%; height: 100%; border-radius: 4px;" onerror="this.style.display='none'">`;
    }
  }

  private updateUI(): void {
    // Update settings toggles
    this.updateToggle('aiToggle', this.settings.aiCategorization);
    this.updateToggle('suggestionsToggle', this.settings.realTimeSuggestions);
    this.updateToggle('autoSaveToggle', this.settings.autoSave);

    // Update analytics
    const bookmarksSavedEl = document.getElementById('bookmarksSaved');
    const suggestionsShownEl = document.getElementById('suggestionsShown');

    if (bookmarksSavedEl) bookmarksSavedEl.textContent = this.analytics.bookmarksSaved.toString();
    if (suggestionsShownEl) suggestionsShownEl.textContent = this.analytics.suggestionsShown.toString();
  }

  private updateToggle(id: string, active: boolean): void {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.classList.toggle('active', active);
    }
  }

  private async getAISuggestions(): Promise<void> {
    if (!this.currentTab?.url || !this.settings.aiCategorization) return;

    try {
      const analysisResult = await this.analyzeCurrentPage();
      if (analysisResult) {
        this.displayAISuggestions(analysisResult);
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  }

  private async analyzeCurrentPage(): Promise<AIAnalysisResult | null> {
    if (!this.currentTab?.url) return null;

    try {
      // Get page content
      let content = '';
      if (this.currentTab.id) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: this.currentTab.id },
            func: this.extractPageContent
          });
          content = results[0]?.result || '';
        } catch (error) {
          console.warn('Could not extract page content:', error);
        }
      }

      // Analyze with AI (mock implementation for now)
      return this.getMockAnalysis(this.currentTab.url, this.currentTab.title || '', content);
    } catch (error) {
      console.error('Failed to analyze page:', error);
      return null;
    }
  }

  private extractPageContent(): string {
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

  private getMockAnalysis(url: string, title: string, content: string): AIAnalysisResult {
    // Mock AI analysis - in production this would call the actual AI API
    const domain = this.extractDomain(url);
    
    let category = 'general';
    let tags: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // Basic categorization based on domain and title
    if (domain.includes('github.com') || title.toLowerCase().includes('code') || title.toLowerCase().includes('programming')) {
      category = 'development';
      tags = ['programming', 'code', 'development'];
      priority = 'high';
    } else if (domain.includes('youtube.com') || domain.includes('netflix.com')) {
      category = 'entertainment';
      tags = ['video', 'entertainment'];
      priority = 'low';
    } else if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) {
      category = 'news';
      tags = ['news', 'current-events'];
      priority = 'medium';
    } else if (title.toLowerCase().includes('tutorial') || title.toLowerCase().includes('how to')) {
      category = 'learning';
      tags = ['tutorial', 'education', 'learning'];
      priority = 'high';
    } else if (domain.includes('amazon') || domain.includes('shop') || title.toLowerCase().includes('buy')) {
      category = 'shopping';
      tags = ['shopping', 'product'];
      priority = 'low';
    }

    return {
      category,
      tags,
      summary: title,
      priority,
      confidence: 0.8,
      sentiment: 'neutral',
      readingTime: Math.ceil(content.length / 200)
    };
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  private displayAISuggestions(analysis: AIAnalysisResult): void {
    const suggestionsEl = document.getElementById('aiSuggestions');
    const categoryEl = document.getElementById('suggestedCategory');
    const tagsEl = document.getElementById('suggestedTags');
    const priorityEl = document.getElementById('suggestedPriority');

    if (suggestionsEl) suggestionsEl.style.display = 'block';
    if (categoryEl) categoryEl.textContent = analysis.category;
    if (priorityEl) priorityEl.textContent = analysis.priority;

    if (tagsEl) {
      tagsEl.innerHTML = analysis.tags.map(tag => 
        `<span class="tag">${tag}</span>`
      ).join('');
    }
  }

  private async saveCurrentPage(withAI: boolean): Promise<void> {
    if (!this.currentTab?.url) return;

    const button = withAI ? document.getElementById('saveCurrentBtn') : document.getElementById('quickSaveBtn');
    if (button) {
      button.classList.add('loading');
      const originalText = button.innerHTML;
      button.innerHTML = withAI ? 
        '<div class="action-icon"><div class="spinner"></div></div><div class="action-text">Saving...</div>' :
        '<div class="action-icon"><div class="spinner"></div></div><div class="action-text">Saving...</div>';
    }

    try {
      const message = withAI ? 
        { type: 'save_bookmark', url: this.currentTab.url, title: this.currentTab.title } :
        { type: 'save_bookmark_quick', url: this.currentTab.url, title: this.currentTab.title };

      await this.sendMessage(message);
      this.showStatus('Bookmark saved successfully!', 'success');
      
      // Update analytics
      this.analytics.bookmarksSaved++;
      this.updateUI();

    } catch (error) {
      console.error('Failed to save bookmark:', error);
      this.showStatus('Failed to save bookmark', 'error');
    } finally {
      if (button) {
        button.classList.remove('loading');
        setTimeout(() => {
          if (withAI) {
            button.innerHTML = '<div class="action-icon">🤖</div><div class="action-text">Save with AI</div>';
          } else {
            button.innerHTML = '<div class="action-icon">⚡</div><div class="action-text">Quick Save</div>';
          }
        }, 1000);
      }
    }
  }

  private async captureTabs(): Promise<void> {
    const button = document.getElementById('captureTabsBtn');
    if (button) {
      button.classList.add('loading');
      button.innerHTML = '<div class="action-icon"><div class="spinner"></div></div><div class="action-text">Capturing...</div>';
    }

    try {
      await this.sendMessage({ type: 'capture_tabs' });
      this.showStatus('Tabs captured successfully!', 'success');
    } catch (error) {
      console.error('Failed to capture tabs:', error);
      this.showStatus('Failed to capture tabs', 'error');
    } finally {
      if (button) {
        button.classList.remove('loading');
        setTimeout(() => {
          button.innerHTML = '<div class="action-icon">📋</div><div class="action-text">Capture Tabs</div>';
        }, 1000);
      }
    }
  }

  private async openSearch(): Promise<void> {
    try {
      await chrome.tabs.create({
        url: 'http://localhost:3000/search'
      });
      window.close();
    } catch (error) {
      console.error('Failed to open search:', error);
    }
  }

  private async openDashboard(): Promise<void> {
    try {
      await chrome.tabs.create({
        url: 'http://localhost:3000/dashboard'
      });
      window.close();
    } catch (error) {
      console.error('Failed to open dashboard:', error);
    }
  }

  private async toggleSetting(setting: keyof ExtensionSettings): Promise<void> {
    this.settings[setting] = !this.settings[setting];
    
    try {
      await this.sendMessage({ 
        type: 'update_settings', 
        settings: this.settings 
      });
      this.updateUI();
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert the change
      this.settings[setting] = !this.settings[setting];
      this.updateUI();
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status ${type}`;
      statusEl.classList.remove('hidden');
      
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 3000);
    }
  }

  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupManager();
  popup.init().catch(console.error);
});

export {}; 