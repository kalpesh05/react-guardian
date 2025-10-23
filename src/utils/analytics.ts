/**
 * Analytics utilities for React Guardian
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  customTracker?: (event: AnalyticsEvent) => void | Promise<void>;
}

export class Analytics {
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Track an analytics event
   */
  track(event: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };

    this.queue.push(analyticsEvent);

    // If custom tracker is provided, use it immediately
    if (this.config.customTracker) {
      this.config.customTracker(analyticsEvent);
      return;
    }

    // Check if we should flush immediately
    if (this.queue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  /**
   * Track error events
   */
  trackError(error: any, context?: any): void {
    this.track('guardian_error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      severity: 'error'
    });
  }

  /**
   * Track recovery events
   */
  trackRecovery(action: string, success: boolean, metadata?: any): void {
    this.track('guardian_recovery', {
      action,
      success,
      metadata,
      severity: success ? 'info' : 'warning'
    });
  }

  /**
   * Track auto-correct events
   */
  trackAutoCorrect(type: string, success: boolean, metadata?: any): void {
    this.track('guardian_auto_correct', {
      type,
      success,
      metadata,
      severity: success ? 'info' : 'warning'
    });
  }

  /**
   * Track performance events
   */
  trackPerformance(operation: string, duration: number, metadata?: any): void {
    this.track('guardian_performance', {
      operation,
      duration,
      metadata,
      severity: duration > 1000 ? 'warning' : 'info'
    });
  }

  /**
   * Flush all queued events
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0 || !this.config.endpoint) {
      return;
    }

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          events: eventsToSend,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-queue events for retry
      this.queue.unshift(...eventsToSend);
    }
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval || 30000);
  }

  /**
   * Stop analytics and flush any remaining events
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    await this.flush();
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('guardian-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('guardian-session-id', sessionId);
    }
    return sessionId;
  }
}
