import { useCallback } from 'react';
import { useGuardianContext } from './GuardianProvider';
import { UseGuardianReturn, GuardianError, LayoutAnomaly, RecoveryAction } from './types';

/**
 * Main hook for accessing Guardian functionality
 * Provides easy access to error reporting, anomaly detection, and recovery features
 */
export const useGuardian = (): UseGuardianReturn => {
  const context = useGuardianContext();

  // Enhanced error reporting with automatic metadata
  const reportError = useCallback((error: Partial<GuardianError>) => {
    const enhancedError: GuardianError = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: error.timestamp || Date.now(),
      userAgent: error.userAgent || navigator.userAgent,
      url: error.url || window.location.href,
      sessionId: error.sessionId || getSessionId(),
      userId: error.userId,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
      metadata: {
        ...error.metadata,
        hook: 'useGuardian',
        timestamp: Date.now()
      }
    };

    context.reportError(enhancedError);
  }, [context]);

  // Enhanced anomaly reporting
  const reportAnomaly = useCallback((anomaly: Partial<LayoutAnomaly>) => {
    const enhancedAnomaly: LayoutAnomaly = {
      type: anomaly.type || 'sizing',
      element: anomaly.element || document.body,
      severity: anomaly.severity || 'medium',
      description: anomaly.description || 'Layout anomaly detected',
      timestamp: anomaly.timestamp || Date.now(),
      selector: anomaly.selector || getElementSelector(anomaly.element || document.body),
      computedStyles: anomaly.computedStyles,
      boundingRect: anomaly.boundingRect
    };

    context.reportAnomaly(enhancedAnomaly);
  }, [context]);

  // Enhanced recovery triggering
  const triggerRecovery = useCallback((action: RecoveryAction) => {
    context.triggerRecovery(action);
  }, [context]);

  return {
    reportError,
    reportAnomaly,
    triggerRecovery,
    isRecovering: context.isRecovering,
    errorCount: context.errorCount,
    anomalyCount: context.anomalyCount,
    lastError: context.lastError,
    lastAnomaly: context.lastAnomaly,
    autoCorrectCount: context.autoCorrectCount,
    lastAutoCorrect: context.lastAutoCorrect
  };
};

/**
 * Hook for manual error reporting with additional utilities
 */
export const useErrorReporting = () => {
  const { reportError, errorCount, lastError } = useGuardian();

  const reportAsyncError = useCallback(async (asyncFn: () => Promise<any>, context?: any) => {
    try {
      return await asyncFn();
    } catch (error) {
      reportError({
        message: error instanceof Error ? error.message : 'Async operation failed',
        stack: error instanceof Error ? error.stack : undefined,
        metadata: {
          ...context,
          type: 'async_error'
        }
      });
      throw error;
    }
  }, [reportError]);

  const reportNetworkError = useCallback((url: string, status: number, response?: any) => {
    reportError({
      message: `Network request failed: ${status}`,
      metadata: {
        type: 'network_error',
        url,
        status,
        response
      }
    });
  }, [reportError]);

  const reportValidationError = useCallback((field: string, value: any, rule: string) => {
    reportError({
      message: `Validation failed for ${field}`,
      metadata: {
        type: 'validation_error',
        field,
        value,
        rule
      }
    });
  }, [reportError]);

  return {
    reportError,
    reportAsyncError,
    reportNetworkError,
    reportValidationError,
    errorCount,
    lastError
  };
};

/**
 * Hook for layout monitoring and anomaly detection
 */
export const useLayoutMonitoring = () => {
  const { reportAnomaly, anomalyCount, lastAnomaly } = useGuardian();

  const checkElementAnomaly = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // Check for common layout issues
    if (rect.width === 0 || rect.height === 0) {
      reportAnomaly({
        type: 'sizing',
        element,
        severity: 'high',
        description: 'Element has zero dimensions',
        selector: getElementSelector(element),
        boundingRect: rect
      });
    }

    if (computedStyle.overflow !== 'visible' && (rect.width > window.innerWidth || rect.height > window.innerHeight)) {
      reportAnomaly({
        type: 'overflow',
        element,
        severity: 'medium',
        description: 'Element overflows viewport',
        selector: getElementSelector(element),
        boundingRect: rect
      });
    }

    if (computedStyle.position === 'absolute' && (rect.left < 0 || rect.top < 0)) {
      reportAnomaly({
        type: 'positioning',
        element,
        severity: 'low',
        description: 'Absolutely positioned element outside viewport',
        selector: getElementSelector(element),
        boundingRect: rect
      });
    }
  }, [reportAnomaly]);

  const monitorElement = useCallback((element: Element, interval = 1000) => {
    const intervalId = setInterval(() => {
      checkElementAnomaly(element);
    }, interval);

    return () => clearInterval(intervalId);
  }, [checkElementAnomaly]);

  return {
    checkElementAnomaly,
    monitorElement,
    reportAnomaly,
    anomalyCount,
    lastAnomaly
  };
};

/**
 * Hook for recovery management
 */
export const useRecovery = () => {
  const { triggerRecovery, isRecovering } = useGuardian();

  const retryOperation = useCallback((operation: () => Promise<any>, maxRetries = 3) => {
    let retryCount = 0;

    const attempt = async (): Promise<any> => {
      try {
        return await operation();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          triggerRecovery({
            strategy: 'retry',
            maxRetries: maxRetries - retryCount
          });
          return attempt();
        }
        throw error;
      }
    };

    return attempt();
  }, [triggerRecovery]);

  const fallbackToDefault = useCallback((fallbackComponent?: React.ComponentType<any>) => {
    triggerRecovery({
      strategy: 'fallback',
      fallbackComponent
    });
  }, [triggerRecovery]);

  const reloadPage = useCallback(() => {
    triggerRecovery({
      strategy: 'reload'
    });
  }, [triggerRecovery]);

  const redirectTo = useCallback((url: string) => {
    triggerRecovery({
      strategy: 'redirect',
      redirectUrl: url
    });
  }, [triggerRecovery]);

  return {
    retryOperation,
    fallbackToDefault,
    reloadPage,
    redirectTo,
    isRecovering
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const { reportError } = useGuardian();

  const measurePerformance = useCallback((name: string, fn: () => any) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    if (duration > 100) { // Report if operation takes more than 100ms
      reportError({
        message: `Performance issue detected: ${name} took ${duration.toFixed(2)}ms`,
        metadata: {
          type: 'performance_issue',
          operation: name,
          duration,
          threshold: 100
        }
      });
    }

    return result;
  }, [reportError]);

  const measureAsyncPerformance = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    if (duration > 1000) { // Report if async operation takes more than 1s
      reportError({
        message: `Async performance issue detected: ${name} took ${duration.toFixed(2)}ms`,
        metadata: {
          type: 'async_performance_issue',
          operation: name,
          duration,
          threshold: 1000
        }
      });
    }

    return result;
  }, [reportError]);

  return {
    measurePerformance,
    measureAsyncPerformance
  };
};

/**
 * Hook for auto-correct functionality
 */
export const useAutoCorrect = () => {
  const { autoCorrectCount, lastAutoCorrect } = useGuardian();

  const saveContentSnapshot = useCallback(() => {
    // This would typically be handled by the AutoCorrect instance
    // For now, we'll just log that it should be saved
    console.log('Content snapshot should be saved');
  }, []);

  const triggerWhitePageFix = useCallback(() => {
    // Trigger white page detection and fix
    console.log('Triggering white page fix');
  }, []);

  const triggerPageBreakFix = useCallback((element: Element) => {
    // Trigger page break fix for specific element
    console.log('Triggering page break fix for element:', element);
  }, []);

  return {
    autoCorrectCount,
    lastAutoCorrect,
    saveContentSnapshot,
    triggerWhitePageFix,
    triggerPageBreakFix
  };
};

// Utility functions
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('guardian-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('guardian-session-id', sessionId);
  }
  return sessionId;
}

function getElementSelector(element: Element): string {
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
