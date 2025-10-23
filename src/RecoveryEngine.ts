import { RecoveryAction, RecoveryEngineConfig, RecoveryStrategy } from './types';

export class RecoveryEngine {
  private config: RecoveryEngineConfig;
  private retryCount = 0;
  private isRecovering = false;

  constructor(config: RecoveryEngineConfig) {
    this.config = config;
  }

  /**
   * Execute a recovery action
   */
  async execute(action: RecoveryAction): Promise<boolean> {
    if (!this.config.enabled || this.isRecovering) {
      return false;
    }

    this.isRecovering = true;
    this.config.onRecovery(action);

    try {
      const success = await this.performRecovery(action);
      
      if (success) {
        this.retryCount = 0;
        this.isRecovering = false;
        return true;
      } else {
        // If recovery failed and we haven't exceeded max retries, try again
        if (this.retryCount < this.config.maxRetries) {
          this.retryCount++;
          return this.execute(action);
        } else {
          this.isRecovering = false;
          return false;
        }
      }
    } catch (error) {
      console.error('Recovery execution failed:', error);
      this.isRecovering = false;
      return false;
    }
  }

  /**
   * Perform the actual recovery based on strategy
   */
  private async performRecovery(action: RecoveryAction): Promise<boolean> {
    switch (action.strategy) {
      case 'retry':
        return this.handleRetry(action);
      
      case 'fallback':
        return this.handleFallback(action);
      
      case 'reload':
        return this.handleReload(action);
      
      case 'redirect':
        return this.handleRedirect(action);
      
      case 'custom':
        return this.handleCustom(action);
      
      default:
        console.warn(`Unknown recovery strategy: ${action.strategy}`);
        return false;
    }
  }

  /**
   * Handle retry strategy
   */
  private async handleRetry(action: RecoveryAction): Promise<boolean> {
    const maxRetries = action.maxRetries || this.config.maxRetries;
    const retryCount = action.retryCount || 0;

    if (retryCount >= maxRetries) {
      console.warn('Max retries exceeded for recovery action');
      return false;
    }

    // Wait before retry (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    await this.delay(delay);

    // For retry strategy, we consider it successful if we can attempt it
    // The actual retry logic should be handled by the calling component
    return true;
  }

  /**
   * Handle fallback strategy
   */
  private async handleFallback(_action: RecoveryAction): Promise<boolean> {
    try {
      if (_action.fallbackComponent) {
        // This would typically be handled by the React component tree
        // The fallback component should be rendered by the SmartBoundary
        // console.log('Fallback component strategy executed');
        return true;
      } else if (this.config.fallbackComponent) {
        // console.log('Default fallback component strategy executed');
        return true;
      } else {
        // console.warn('No fallback component available');
        return false;
      }
    } catch (error) {
      // console.error('Fallback strategy failed:', error);
      return false;
    }
  }

  /**
   * Handle reload strategy
   */
  private async handleReload(_action: RecoveryAction): Promise<boolean> {
    try {
      // Soft reload - try to reload the current page
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Reload strategy failed:', error);
      return false;
    }
  }

  /**
   * Handle redirect strategy
   */
  private async handleRedirect(action: RecoveryAction): Promise<boolean> {
    try {
      if (action.redirectUrl) {
        window.location.href = action.redirectUrl;
        return true;
      } else {
        // Default redirect to home page
        window.location.href = '/';
        return true;
      }
    } catch (error) {
      console.error('Redirect strategy failed:', error);
      return false;
    }
  }

  /**
   * Handle custom strategy
   */
  private async handleCustom(action: RecoveryAction): Promise<boolean> {
    try {
      if (action.customAction) {
        await action.customAction();
        return true;
      } else {
        console.warn('Custom action not provided');
        return false;
      }
    } catch (error) {
      console.error('Custom strategy failed:', error);
      return false;
    }
  }

  /**
   * Get smart recovery suggestions based on error type
   */
  getSmartRecoverySuggestions(error: Error, _context?: any): RecoveryAction[] {
    const suggestions: RecoveryAction[] = [];

    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      suggestions.push({
        strategy: 'retry',
        maxRetries: 3
      });
      suggestions.push({
        strategy: 'fallback',
        fallbackComponent: this.config.fallbackComponent
      });
    }

    // JavaScript errors
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      suggestions.push({
        strategy: 'retry',
        maxRetries: 1
      });
      suggestions.push({
        strategy: 'fallback',
        fallbackComponent: this.config.fallbackComponent
      });
    }

    // Chunk loading errors (common in React apps with code splitting)
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      suggestions.push({
        strategy: 'reload'
      });
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      suggestions.push({
        strategy: 'redirect',
        redirectUrl: '/login'
      });
    }

    // Permission errors
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      suggestions.push({
        strategy: 'redirect',
        redirectUrl: '/unauthorized'
      });
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      suggestions.push({
        strategy: 'retry',
        maxRetries: 2
      });
      suggestions.push({
        strategy: 'fallback',
        fallbackComponent: this.config.fallbackComponent
      });
    }

    // If no specific suggestions, provide generic ones
    if (suggestions.length === 0) {
      suggestions.push(
        {
          strategy: 'retry',
          maxRetries: 1
        },
        {
          strategy: 'fallback',
          fallbackComponent: this.config.fallbackComponent
        }
      );
    }

    return suggestions;
  }

  /**
   * Check if a strategy is supported
   */
  isStrategySupported(strategy: RecoveryStrategy): boolean {
    return this.config.strategies.includes(strategy);
  }

  /**
   * Get current retry count
   */
  getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * Reset retry count
   */
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  /**
   * Check if currently recovering
   */
  isCurrentlyRecovering(): boolean {
    return this.isRecovering;
  }

  /**
   * Utility function to create delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
