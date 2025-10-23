import { GuardianError, ReporterConfig } from './types';

export class Reporter {
  private config: ReporterConfig;
  private queue: GuardianError[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config?: ReporterConfig) {
    this.config = {
      batchSize: 10,
      flushInterval: 5000,
      enabled: true,
      ...config
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Report an error to the configured endpoint or custom reporter
   */
  async report(error: GuardianError): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Add to queue
    this.queue.push(error);

    // If custom reporter is provided, use it immediately
    if (this.config.customReporter) {
      try {
        await this.config.customReporter(error);
      } catch (err) {
        console.error('Custom reporter failed:', err);
      }
      return;
    }

    // Check if we should flush immediately
    if (this.queue.length >= (this.config.batchSize || 10)) {
      await this.flush();
    }
  }

  /**
   * Flush all queued errors
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0 || !this.config.endpoint) {
      return;
    }

    const errorsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to report errors:', error);
      // Re-queue errors for retry, but limit the queue size
      if (this.queue.length < 100) {
        this.queue.unshift(...errorsToSend);
      }
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
    }, this.config.flushInterval || 5000);
  }

  /**
   * Stop the reporter and flush any remaining errors
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    await this.flush();
  }

  /**
   * Update reporter configuration
   */
  updateConfig(newConfig: Partial<ReporterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the error queue
   */
  clearQueue(): void {
    this.queue = [];
  }
}
