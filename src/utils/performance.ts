/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PerformanceConfig {
  enabled: boolean;
  threshold: number; // Report if operation takes longer than this (ms)
  maxEntries: number; // Maximum number of entries to keep
  onMetric?: (metric: PerformanceMetrics) => void;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor(config: PerformanceConfig) {
    this.config = config;
    
    if (this.config.enabled) {
      this.setupObservers();
    }
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(name: string, operation: () => T, metadata?: Record<string, any>): T {
    if (!this.config.enabled) {
      return operation();
    }

    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata
    });

    return result;
  }

  /**
   * Measure an asynchronous operation
   */
  async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.config.enabled) {
      return operation();
    }

    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata
    });

    return result;
  }

  /**
   * Start a performance mark
   */
  startMark(name: string): void {
    if (!this.config.enabled) return;
    performance.mark(`${name}-start`);
  }

  /**
   * End a performance mark and measure duration
   */
  endMark(name: string, metadata?: Record<string, any>): number {
    if (!this.config.enabled) return 0;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries.length > 0 ? entries[entries.length - 1].duration : 0;

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata
    });

    // Clean up marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent entries
    if (this.metrics.length > this.config.maxEntries) {
      this.metrics = this.metrics.slice(-this.config.maxEntries);
    }

    // Report if threshold is exceeded
    if (metric.duration > this.config.threshold) {
      this.config.onMetric?.(metric);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Setup performance observers
   */
  private setupObservers(): void {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long-task',
              duration: entry.duration,
              timestamp: Date.now(),
              metadata: {
                type: 'long-task',
                startTime: entry.startTime
              }
            });
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }

      // Observe layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) return;

            this.recordMetric({
              name: 'layout-shift',
              duration: entry.value,
              timestamp: Date.now(),
              metadata: {
                type: 'layout-shift',
                value: entry.value,
                sources: entry.sources
              }
            });
          }
        });

        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (error) {
        console.warn('Layout shift observer not supported:', error);
      }
    }
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}
