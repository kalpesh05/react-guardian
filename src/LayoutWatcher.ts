import { LayoutAnomaly, LayoutWatcherConfig } from './types';

export class LayoutWatcher {
  private config: LayoutWatcherConfig;
  private observer?: MutationObserver;
  private resizeObserver?: ResizeObserver;
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;
  private baselineMetrics: Map<Element, DOMRect> = new Map();

  constructor(config: LayoutWatcherConfig) {
    this.config = config;
  }

  /**
   * Start monitoring for layout anomalies
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.establishBaseline();
    this.setupObservers();
    this.startPeriodicCheck();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.baselineMetrics.clear();
  }

  /**
   * Establish baseline metrics for elements
   */
  private establishBaseline(): void {
    const elements = this.getElementsToWatch();
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      this.baselineMetrics.set(element, rect);
    });
  }

  /**
   * Get elements to watch based on selectors
   */
  private getElementsToWatch(): Element[] {
    const elements: Element[] = [];
    
    this.config.selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
      }
    });

    return elements;
  }

  /**
   * Setup mutation and resize observers
   */
  private setupObservers(): void {
    // Mutation observer for DOM changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementForAnomalies(node as Element);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Resize observer for size changes
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.checkElementForAnomalies(entry.target);
      });
    });

    // Observe all current elements
    this.getElementsToWatch().forEach(element => {
      this.resizeObserver?.observe(element);
    });
  }

  /**
   * Start periodic checks for anomalies
   */
  private startPeriodicCheck(): void {
    this.intervalId = setInterval(() => {
      this.performAnomalyCheck();
    }, this.config.interval);
  }

  /**
   * Perform comprehensive anomaly check
   */
  private performAnomalyCheck(): void {
    const elements = this.getElementsToWatch();
    
    elements.forEach(element => {
      this.checkElementForAnomalies(element);
    });
  }

  /**
   * Check a specific element for layout anomalies
   */
  private checkElementForAnomalies(element: Element): void {
    // Check if element is still in the DOM
    if (!document.contains(element)) {
      this.baselineMetrics.delete(element);
      return;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const baseline = this.baselineMetrics.get(element);

    // Check for overflow anomalies
    this.checkOverflowAnomaly(element, rect, computedStyle);
    
    // Check for clipping anomalies
    this.checkClippingAnomaly(element, rect, computedStyle);
    
    // Check for positioning anomalies
    this.checkPositioningAnomaly(element, rect, baseline);
    
    // Check for sizing anomalies
    this.checkSizingAnomaly(element, rect, baseline);
    
    // Check for visibility anomalies
    this.checkVisibilityAnomaly(element, computedStyle);

    // Update baseline
    this.baselineMetrics.set(element, rect);
  }

  /**
   * Check for overflow anomalies
   */
  private checkOverflowAnomaly(element: Element, rect: DOMRect, computedStyle: CSSStyleDeclaration): void {
    const overflowX = computedStyle.overflowX;
    const overflowY = computedStyle.overflowY;
    
    if (overflowX === 'visible' || overflowY === 'visible') {
      const parent = element.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const overflowX = rect.right > parentRect.right || rect.left < parentRect.left;
        const overflowY = rect.bottom > parentRect.bottom || rect.top < parentRect.top;
        
        if (overflowX || overflowY) {
          this.reportAnomaly({
            type: 'overflow',
            element,
            severity: this.calculateSeverity(rect, parentRect),
            description: `Element overflows parent container (X: ${overflowX}, Y: ${overflowY})`,
            timestamp: Date.now(),
            selector: this.getElementSelector(element),
            computedStyles: {
              overflowX: computedStyle.overflowX,
              overflowY: computedStyle.overflowY
            },
            boundingRect: rect
          });
        }
      }
    }
  }

  /**
   * Check for clipping anomalies
   */
  private checkClippingAnomaly(element: Element, rect: DOMRect, computedStyle: CSSStyleDeclaration): void {
    const clipPath = computedStyle.clipPath;
    const clip = computedStyle.clip;
    
    if (clipPath !== 'none' || clip !== 'auto') {
      const isClipped = rect.width === 0 || rect.height === 0;
      
      if (isClipped) {
        this.reportAnomaly({
          type: 'clipping',
          element,
          severity: 'high',
          description: 'Element appears to be clipped',
          timestamp: Date.now(),
          selector: this.getElementSelector(element),
          computedStyles: {
            clipPath,
            clip
          },
          boundingRect: rect
        });
      }
    }
  }

  /**
   * Check for positioning anomalies
   */
  private checkPositioningAnomaly(element: Element, rect: DOMRect, baseline?: DOMRect): void {
    if (!baseline) return;

    const position = window.getComputedStyle(element).position;
    const threshold = this.config.thresholds.positioning;

    if (position === 'absolute' || position === 'fixed') {
      const deltaX = Math.abs(rect.left - baseline.left);
      const deltaY = Math.abs(rect.top - baseline.top);
      const deltaDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (deltaDistance > threshold * 100) { // Convert to pixels
        this.reportAnomaly({
          type: 'positioning',
          element,
          severity: this.calculateSeverityFromDelta(deltaDistance),
          description: `Element position changed significantly (${deltaDistance.toFixed(2)}px)`,
          timestamp: Date.now(),
          selector: this.getElementSelector(element),
          boundingRect: rect
        });
      }
    }
  }

  /**
   * Check for sizing anomalies
   */
  private checkSizingAnomaly(element: Element, rect: DOMRect, baseline?: DOMRect): void {
    if (!baseline) return;

    const threshold = this.config.thresholds.overflow;
    const widthChange = Math.abs(rect.width - baseline.width) / baseline.width;
    const heightChange = Math.abs(rect.height - baseline.height) / baseline.height;

    if (widthChange > threshold || heightChange > threshold) {
      this.reportAnomaly({
        type: 'sizing',
        element,
        severity: this.calculateSeverityFromDelta(Math.max(widthChange, heightChange)),
        description: `Element size changed significantly (W: ${widthChange.toFixed(2)}, H: ${heightChange.toFixed(2)})`,
        timestamp: Date.now(),
        selector: this.getElementSelector(element),
        boundingRect: rect
      });
    }
  }

  /**
   * Check for visibility anomalies
   */
  private checkVisibilityAnomaly(element: Element, computedStyle: CSSStyleDeclaration): void {
    const visibility = computedStyle.visibility;
    const display = computedStyle.display;
    const opacity = parseFloat(computedStyle.opacity);

    if (visibility === 'hidden' || display === 'none' || opacity === 0) {
      // Check if this might be unintentional
      const hasContent = element.textContent?.trim() || element.children.length > 0;
      
      if (hasContent) {
        this.reportAnomaly({
          type: 'visibility',
          element,
          severity: 'medium',
          description: `Element with content is not visible (visibility: ${visibility}, display: ${display}, opacity: ${opacity})`,
          timestamp: Date.now(),
          selector: this.getElementSelector(element),
          computedStyles: {
            visibility,
            display,
            opacity: computedStyle.opacity
          }
        });
      }
    }
  }

  /**
   * Calculate severity based on element and parent dimensions
   */
  private calculateSeverity(rect: DOMRect, parentRect: DOMRect): 'low' | 'medium' | 'high' | 'critical' {
    const overflowRatio = Math.max(
      (rect.right - parentRect.right) / parentRect.width,
      (parentRect.left - rect.left) / parentRect.width,
      (rect.bottom - parentRect.bottom) / parentRect.height,
      (parentRect.top - rect.top) / parentRect.height
    );

    if (overflowRatio > 0.5) return 'critical';
    if (overflowRatio > 0.3) return 'high';
    if (overflowRatio > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity based on delta change
   */
  private calculateSeverityFromDelta(delta: number): 'low' | 'medium' | 'high' | 'critical' {
    if (delta > 100) return 'critical';
    if (delta > 50) return 'high';
    if (delta > 20) return 'medium';
    return 'low';
  }

  /**
   * Get CSS selector for element
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(Boolean);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Report an anomaly
   */
  private reportAnomaly(anomaly: LayoutAnomaly): void {
    this.config.onAnomaly(anomaly);
  }
}
