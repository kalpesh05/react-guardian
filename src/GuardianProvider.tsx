import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  GuardianContextValue, 
  GuardianProviderProps, 
  GuardianError, 
  LayoutAnomaly, 
  RecoveryAction,
  // GuardianEvent,
  // AutoCorrectConfig,
  AutoCorrectAction
} from './types';
import { Reporter } from './Reporter';
import { LayoutWatcher } from './LayoutWatcher';
import { RecoveryEngine } from './RecoveryEngine';
import { AutoCorrect } from './AutoCorrect';

// Initial state
interface GuardianState {
  errorCount: number;
  anomalyCount: number;
  isRecovering: boolean;
  lastError?: GuardianError;
  lastAnomaly?: LayoutAnomaly;
  errors: GuardianError[];
  anomalies: LayoutAnomaly[];
  autoCorrectCount: number;
  lastAutoCorrect?: AutoCorrectAction;
}

const initialState: GuardianState = {
  errorCount: 0,
  anomalyCount: 0,
  isRecovering: false,
  errors: [],
  anomalies: [],
  autoCorrectCount: 0
};

// Reducer for state management
type GuardianAction = 
  | { type: 'REPORT_ERROR'; payload: GuardianError }
  | { type: 'REPORT_ANOMALY'; payload: LayoutAnomaly }
  | { type: 'START_RECOVERY'; payload: RecoveryAction }
  | { type: 'END_RECOVERY' }
  | { type: 'AUTO_CORRECT'; payload: AutoCorrectAction }
  | { type: 'RESET_STATE' };

function guardianReducer(state: GuardianState, action: GuardianAction): GuardianState {
  switch (action.type) {
    case 'REPORT_ERROR':
      return {
        ...state,
        errorCount: state.errorCount + 1,
        lastError: action.payload,
        errors: [...state.errors.slice(-99), action.payload] // Keep last 100 errors
      };
    
    case 'REPORT_ANOMALY':
      return {
        ...state,
        anomalyCount: state.anomalyCount + 1,
        lastAnomaly: action.payload,
        anomalies: [...state.anomalies.slice(-99), action.payload] // Keep last 100 anomalies
      };
    
    case 'START_RECOVERY':
      return {
        ...state,
        isRecovering: true
      };
    
    case 'END_RECOVERY':
      return {
        ...state,
        isRecovering: false
      };
    
    case 'AUTO_CORRECT':
      return {
        ...state,
        autoCorrectCount: state.autoCorrectCount + 1,
        lastAutoCorrect: action.payload
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const GuardianContext = createContext<GuardianContextValue | null>(null);

// Provider component
export const GuardianProvider: React.FC<GuardianProviderProps> = ({
  children,
  reporter,
  recovery,
  layoutWatcher,
  autoCorrect,
  onError,
  onAnomaly,
  onRecovery,
  onAutoCorrect
}) => {
  const [state, dispatch] = useReducer(guardianReducer, initialState);
  
  // Initialize services
  const reporterInstance = new Reporter(reporter);
  const layoutWatcherInstance = new LayoutWatcher({
    enabled: layoutWatcher?.enabled ?? true,
    interval: layoutWatcher?.interval ?? 1000,
    selectors: layoutWatcher?.selectors ?? ['*'],
    thresholds: {
      overflow: layoutWatcher?.thresholds?.overflow ?? 0.1,
      clipping: layoutWatcher?.thresholds?.clipping ?? 0.1,
      positioning: layoutWatcher?.thresholds?.positioning ?? 0.1,
    },
    onAnomaly: (anomaly) => {
      dispatch({ type: 'REPORT_ANOMALY', payload: anomaly });
      onAnomaly?.(anomaly);
    }
  });
  
  const recoveryEngine = new RecoveryEngine({
    enabled: recovery?.enabled ?? true,
    strategies: recovery?.strategies ?? ['retry', 'fallback', 'reload'],
    maxRetries: recovery?.maxRetries ?? 3,
    fallbackComponent: recovery?.fallbackComponent,
    onRecovery: (action) => {
      dispatch({ type: 'START_RECOVERY', payload: action });
      onRecovery?.(action);
    }
  });

  // Initialize auto-correct
  const autoCorrectInstance = new AutoCorrect({
    enabled: autoCorrect?.enabled ?? true,
    whitePageDetection: {
      enabled: autoCorrect?.whitePageDetection?.enabled ?? true,
      threshold: autoCorrect?.whitePageDetection?.threshold ?? 0.3,
      checkInterval: autoCorrect?.whitePageDetection?.checkInterval ?? 5000
    },
    pageBreakDetection: {
      enabled: autoCorrect?.pageBreakDetection?.enabled ?? true,
      selectors: autoCorrect?.pageBreakDetection?.selectors ?? ['main', '.content', '#app'],
      minHeight: autoCorrect?.pageBreakDetection?.minHeight ?? 100
    },
    visualHealing: {
      enabled: autoCorrect?.visualHealing?.enabled ?? true,
      strategies: autoCorrect?.visualHealing?.strategies ?? ['reload-component', 'fix-layout', 'inject-fallback']
    },
    onAutoCorrect: (action) => {
      dispatch({ type: 'AUTO_CORRECT', payload: action });
      onAutoCorrect?.(action);
    }
  });

  // Report error function
  const reportError = useCallback((error: GuardianError) => {
    const enhancedError: GuardianError = {
      ...error,
      timestamp: error.timestamp || Date.now(),
      userAgent: error.userAgent || navigator.userAgent,
      url: error.url || window.location.href,
      sessionId: error.sessionId || getSessionId(),
    };
    
    dispatch({ type: 'REPORT_ERROR', payload: enhancedError });
    reporterInstance.report(enhancedError);
    onError?.(enhancedError);
  }, [onError]);

  // Report anomaly function
  const reportAnomaly = useCallback((anomaly: LayoutAnomaly) => {
    dispatch({ type: 'REPORT_ANOMALY', payload: anomaly });
    onAnomaly?.(anomaly);
  }, [onAnomaly]);

  // Trigger recovery function
  const triggerRecovery = useCallback((action: RecoveryAction) => {
    recoveryEngine.execute(action);
  }, []);

  // Generate session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('guardian-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('guardian-session-id', sessionId);
    }
    return sessionId;
  }, []);

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error: GuardianError = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: getSessionId(),
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      };
      reportError(error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: GuardianError = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: getSessionId(),
        metadata: {
          reason: event.reason,
          type: 'unhandled_promise_rejection'
        }
      };
      reportError(error);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError, getSessionId]);

  // Start layout watcher
  useEffect(() => {
    if (layoutWatcher?.enabled !== false) {
      layoutWatcherInstance.start();
    }

    return () => {
      layoutWatcherInstance.stop();
    };
  }, [layoutWatcher?.enabled]);

  // Start auto-correct
  useEffect(() => {
    if (autoCorrect?.enabled !== false) {
      autoCorrectInstance.start();
    }

    return () => {
      autoCorrectInstance.stop();
    };
  }, [autoCorrect?.enabled]);

  // Context value
  const contextValue: GuardianContextValue = {
    reportError,
    reportAnomaly,
    triggerRecovery,
    isRecovering: state.isRecovering,
    errorCount: state.errorCount,
    anomalyCount: state.anomalyCount,
    lastError: state.lastError,
    lastAnomaly: state.lastAnomaly,
    autoCorrectCount: state.autoCorrectCount,
    lastAutoCorrect: state.lastAutoCorrect,
  };

  return (
    <GuardianContext.Provider value={contextValue}>
      {children}
    </GuardianContext.Provider>
  );
};

// Hook to use guardian context
export const useGuardianContext = (): GuardianContextValue => {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error('useGuardianContext must be used within a GuardianProvider');
  }
  return context;
};
