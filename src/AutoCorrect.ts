import { GuardianError, LayoutAnomaly } from './types';

export interface AutoCorrectConfig {
  enabled: boolean;
  whitePageDetection: {
    enabled: boolean;
    threshold: number; // Minimum content height to consider non-white
    checkInterval: number;
  };
  pageBreakDetection: {
    enabled: boolean;
    selectors: string[];
    minHeight: number;
  };
  visualHealing: {
    enabled: boolean;
    strategies: AutoCorrectStrategy[];
  };
  onAutoCorrect?: (action: AutoCorrectAction) => void;
}

export interface AutoCorrectAction {
  type: 'white-page-fix' | 'page-break-fix' | 'layout-heal' | 'content-restore';
  element?: Element;
  description: string;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export type AutoCorrectStrategy = 
  | 'reload-component'
  | 'restore-content'
  | 'fix-layout'
  | 'inject-fallback'
  | 'retry-render';

export class AutoCorrect {
  private config: AutoCorrectConfig;
  private whitePageCheckInterval?: NodeJS.Timeout;
  private isRunning = false;
  private lastContentSnapshot: string = '';
  private contentHistory: string[] = [];

  constructor(config: AutoCorrectConfig) {
    this.config = config;
  }

  /**
   * Start auto-correction monitoring
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    if (this.config.whitePageDetection.enabled) {
      this.startWhitePageDetection();
    }
    
    if (this.config.pageBreakDetection.enabled) {
      this.startPageBreakDetection();
    }
    
    if (this.config.visualHealing.enabled) {
      this.startVisualHealing();
    }
  }

  /**
   * Stop auto-correction monitoring
   */
  stop(): void {
    this.isRunning = false;
    
    if (this.whitePageCheckInterval) {
      clearInterval(this.whitePageCheckInterval);
      this.whitePageCheckInterval = undefined;
    }
  }

  /**
   * Start white page detection
   */
  private startWhitePageDetection(): void {
    this.whitePageCheckInterval = setInterval(() => {
      this.checkForWhitePage();
    }, this.config.whitePageDetection.checkInterval);
  }

  /**
   * Check for white page conditions
   */
  private checkForWhitePage(): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Check if page has minimal content
    const contentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    
    const viewportHeight = window.innerHeight;
    const contentRatio = contentHeight / viewportHeight;
    
    // Check for white page conditions
    if (contentRatio < this.config.whitePageDetection.threshold) {
      this.handleWhitePage();
    }
    
    // Check for completely empty page
    const hasVisibleContent = this.hasVisibleContent();
    if (!hasVisibleContent && contentHeight < 100) {
      this.handleEmptyPage();
    }
  }

  /**
   * Check if page has visible content
   */
  private hasVisibleContent(): boolean {
    const elements = document.querySelectorAll('*');
    let visibleCount = 0;
    
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (style.display !== 'none' && 
          style.visibility !== 'hidden' && 
          style.opacity !== '0' &&
          element.textContent?.trim()) {
        visibleCount++;
        if (visibleCount > 3) return true; // Enough content found
      }
    }
    
    return false;
  }

  /**
   * Handle white page detection
   */
  private handleWhitePage(): void {
    console.warn('White page detected - attempting auto-correction');
    
    // Try to restore from content history
    if (this.contentHistory.length > 0) {
      this.restoreFromHistory();
      return;
    }
    
    // Try to reload the page
    this.attemptPageReload();
  }

  /**
   * Handle completely empty page
   */
  private handleEmptyPage(): void {
    console.warn('Empty page detected - attempting auto-correction');
    
    // Try to inject fallback content
    this.injectFallbackContent();
    
    // Try to reload the page
    setTimeout(() => {
      this.attemptPageReload();
    }, 2000);
  }

  /**
   * Start page break detection
   */
  private startPageBreakDetection(): void {
    const observer = new MutationObserver(() => {
      this.checkForPageBreaks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  /**
   * Check for page breaks in layout
   */
  private checkForPageBreaks(): void {
    this.config.pageBreakDetection.selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        // Check for elements that are too short (potential page breaks)
        if (rect.height < this.config.pageBreakDetection.minHeight) {
          this.handlePageBreak(element);
        }
        
        // Check for elements with unexpected positioning
        if (rect.top < 0 || rect.left < 0) {
          this.handleMispositionedElement(element);
        }
      });
    });
  }

  /**
   * Handle page break in element
   */
  private handlePageBreak(element: Element): void {
    console.warn('Page break detected in element:', element);
    
    // Try to fix the element's layout
    this.fixElementLayout(element);
    
    // Report the auto-correction
    this.reportAutoCorrect({
      type: 'page-break-fix',
      element,
      description: 'Fixed page break in element',
      timestamp: Date.now(),
      success: true,
      metadata: {
        selector: element.tagName.toLowerCase(),
        height: element.getBoundingClientRect().height
      }
    });
  }

  /**
   * Handle mispositioned element
   */
  private handleMispositionedElement(element: Element): void {
    console.warn('Mispositioned element detected:', element);
    
    // Try to fix positioning
    this.fixElementPositioning(element);
    
    this.reportAutoCorrect({
      type: 'layout-heal',
      element,
      description: 'Fixed element positioning',
      timestamp: Date.now(),
      success: true
    });
  }

  /**
   * Start visual healing monitoring
   */
  private startVisualHealing(): void {
    // Monitor for common layout issues
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.checkForVisualIssues(entry.target);
      });
    });
    
    // Observe all elements
    document.querySelectorAll('*').forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Check for visual issues in element
   */
  private checkForVisualIssues(element: Element): void {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // Check for invisible but present elements
    if (rect.width === 0 && rect.height === 0 && element.children.length > 0) {
      this.fixInvisibleElement(element);
    }
    
    // Check for overflow issues
    if (rect.width > window.innerWidth || rect.height > window.innerHeight) {
      this.fixOverflowElement(element);
    }
    
    // Check for z-index issues
    if (style.zIndex === 'auto' && style.position === 'absolute') {
      this.fixZIndexIssues(element);
    }
  }

  /**
   * Fix element layout
   */
  private fixElementLayout(element: Element): void {
    const strategies = this.config.visualHealing.strategies;
    
    for (const strategy of strategies) {
      switch (strategy) {
        case 'reload-component':
          this.reloadComponent(element);
          break;
        case 'restore-content':
          this.restoreContent(element);
          break;
        case 'fix-layout':
          this.fixLayout(element);
          break;
        case 'inject-fallback':
          this.injectFallback(element);
          break;
        case 'retry-render':
          this.retryRender(element);
          break;
      }
    }
  }

  /**
   * Fix element positioning
   */
  private fixElementPositioning(element: Element): void {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // If element is positioned outside viewport, try to bring it back
    if (rect.top < 0 || rect.left < 0) {
      (element as HTMLElement).style.position = 'relative';
      (element as HTMLElement).style.top = '0';
      (element as HTMLElement).style.left = '0';
    }
  }

  /**
   * Fix invisible element
   */
  private fixInvisibleElement(element: Element): void {
    const style = window.getComputedStyle(element);
    
    // Try to make element visible
    if (style.display === 'none') {
      (element as HTMLElement).style.display = 'block';
    }
    
    if (style.visibility === 'hidden') {
      (element as HTMLElement).style.visibility = 'visible';
    }
    
    if (style.opacity === '0') {
      (element as HTMLElement).style.opacity = '1';
    }
  }

  /**
   * Fix overflow element
   */
  private fixOverflowElement(element: Element): void {
    const rect = element.getBoundingClientRect();
    
    if (rect.width > window.innerWidth) {
      (element as HTMLElement).style.maxWidth = '100vw';
      (element as HTMLElement).style.overflowX = 'auto';
    }
    
    if (rect.height > window.innerHeight) {
      (element as HTMLElement).style.maxHeight = '100vh';
      (element as HTMLElement).style.overflowY = 'auto';
    }
  }

  /**
   * Fix z-index issues
   */
  private fixZIndexIssues(element: Element): void {
    (element as HTMLElement).style.zIndex = '1';
  }

  /**
   * Reload component
   */
  private reloadComponent(element: Element): void {
    // Force re-render by temporarily hiding and showing
    const originalDisplay = (element as HTMLElement).style.display;
    (element as HTMLElement).style.display = 'none';
    
    setTimeout(() => {
      (element as HTMLElement).style.display = originalDisplay || 'block';
    }, 100);
  }

  /**
   * Restore content from history
   */
  private restoreContent(element: Element): void {
    if (this.contentHistory.length > 0) {
      const lastContent = this.contentHistory[this.contentHistory.length - 1];
      element.innerHTML = lastContent;
    }
  }

  /**
   * Fix layout issues
   */
  private fixLayout(element: Element): void {
    const style = window.getComputedStyle(element);
    
    // Reset problematic styles
    if (style.position === 'absolute' && !style.top && !style.left) {
      (element as HTMLElement).style.position = 'relative';
    }
    
    // Ensure proper display
    if (style.display === 'none') {
      (element as HTMLElement).style.display = 'block';
    }
  }

  /**
   * Inject fallback content
   */
  private injectFallback(element: Element): void {
    const fallbackContent = document.createElement('div');
    fallbackContent.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #666;">
        <h3>Content Loading...</h3>
        <p>Please wait while we restore the page content.</p>
      </div>
    `;
    
    element.appendChild(fallbackContent);
  }

  /**
   * Retry render
   */
  private retryRender(element: Element): void {
    // Trigger a re-render by cloning and replacing
    const parent = element.parentNode;
    if (parent) {
      const clone = element.cloneNode(true);
      parent.replaceChild(clone, element);
    }
  }

  /**
   * Restore from content history
   */
  private restoreFromHistory(): void {
    if (this.contentHistory.length > 0) {
      const lastContent = this.contentHistory.pop();
      if (lastContent) {
        document.body.innerHTML = lastContent;
        
        this.reportAutoCorrect({
          type: 'content-restore',
          description: 'Restored content from history',
          timestamp: Date.now(),
          success: true
        });
      }
    }
  }

  /**
   * Attempt page reload
   */
  private attemptPageReload(): void {
    // Try soft reload first
    window.location.reload();
  }

  /**
   * Inject fallback content for empty page
   */
  private injectFallbackContent(): void {
    const fallbackHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, sans-serif;
        background: #f8f9fa;
      ">
        <h1 style="color: #333; margin-bottom: 20px;">Page Loading...</h1>
        <p style="color: #666; margin-bottom: 30px;">We're working to restore your page.</p>
        <button onclick="window.location.reload()" style="
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Reload Page</button>
      </div>
    `;
    
    document.body.innerHTML = fallbackHTML;
  }

  /**
   * Report auto-correction action
   */
  private reportAutoCorrect(action: AutoCorrectAction): void {
    this.config.onAutoCorrect?.(action);
  }

  /**
   * Save content snapshot
   */
  saveContentSnapshot(): void {
    this.lastContentSnapshot = document.body.innerHTML;
    this.contentHistory.push(this.lastContentSnapshot);
    
    // Keep only last 5 snapshots
    if (this.contentHistory.length > 5) {
      this.contentHistory.shift();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoCorrectConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutoCorrectConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
