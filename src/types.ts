import { ReactNode, ComponentType } from 'react';

// Core error types
export interface GuardianError {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  metadata?: Record<string, any>;
}

// Layout anomaly types
export interface LayoutAnomaly {
  type: 'overflow' | 'clipping' | 'positioning' | 'sizing' | 'visibility';
  element: Element;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  selector?: string;
  computedStyles?: Record<string, string>;
  boundingRect?: DOMRect;
}

// Recovery strategies
export type RecoveryStrategy = 
  | 'retry'
  | 'fallback'
  | 'reload'
  | 'redirect'
  | 'custom';

export interface RecoveryAction {
  strategy: RecoveryStrategy;
  fallbackComponent?: ComponentType<any>;
  redirectUrl?: string;
  retryCount?: number;
  maxRetries?: number;
  customAction?: () => void | Promise<void>;
}

// Reporter configuration
export interface ReporterConfig {
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  customReporter?: (error: GuardianError) => void | Promise<void>;
  enabled?: boolean;
}

// Guardian context
export interface GuardianContextValue {
  reportError: (error: GuardianError) => void;
  reportAnomaly: (anomaly: LayoutAnomaly) => void;
  triggerRecovery: (action: RecoveryAction) => void;
  isRecovering: boolean;
  errorCount: number;
  anomalyCount: number;
  lastError?: GuardianError;
  lastAnomaly?: LayoutAnomaly;
  autoCorrectCount: number;
  lastAutoCorrect?: AutoCorrectAction;
}

// Guardian provider props
export interface GuardianProviderProps {
  children: ReactNode;
  reporter?: ReporterConfig;
  recovery?: {
    enabled?: boolean;
    strategies?: RecoveryStrategy[];
    maxRetries?: number;
    fallbackComponent?: ComponentType<any>;
  };
  layoutWatcher?: {
    enabled?: boolean;
    interval?: number;
    selectors?: string[];
    thresholds?: {
      overflow?: number;
      clipping?: number;
      positioning?: number;
    };
  };
  autoCorrect?: {
    enabled?: boolean;
    whitePageDetection?: {
      enabled?: boolean;
      threshold?: number;
      checkInterval?: number;
    };
    pageBreakDetection?: {
      enabled?: boolean;
      selectors?: string[];
      minHeight?: number;
    };
    visualHealing?: {
      enabled?: boolean;
      strategies?: AutoCorrectStrategy[];
    };
  };
  onError?: (error: GuardianError) => void;
  onAnomaly?: (anomaly: LayoutAnomaly) => void;
  onRecovery?: (action: RecoveryAction) => void;
  onAutoCorrect?: (action: AutoCorrectAction) => void;
}

// Smart boundary props
export interface SmartBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: GuardianError; retry: () => void }>;
  onError?: (error: GuardianError) => void;
  onRecovery?: (action: RecoveryAction) => void;
  isolate?: boolean;
  name?: string;
}

// Layout watcher configuration
export interface LayoutWatcherConfig {
  enabled: boolean;
  interval: number;
  selectors: string[];
  thresholds: {
    overflow: number;
    clipping: number;
    positioning: number;
  };
  onAnomaly: (anomaly: LayoutAnomaly) => void;
}

// Recovery engine configuration
export interface RecoveryEngineConfig {
  enabled: boolean;
  strategies: RecoveryStrategy[];
  maxRetries: number;
  fallbackComponent?: ComponentType<any>;
  onRecovery: (action: RecoveryAction) => void;
}

// Hook return type
export interface UseGuardianReturn {
  reportError: (error: Partial<GuardianError>) => void;
  reportAnomaly: (anomaly: Partial<LayoutAnomaly>) => void;
  triggerRecovery: (action: RecoveryAction) => void;
  isRecovering: boolean;
  errorCount: number;
  anomalyCount: number;
  lastError?: GuardianError;
  lastAnomaly?: LayoutAnomaly;
}

// Event types for internal communication
export type GuardianEvent = 
  | { type: 'ERROR'; payload: GuardianError }
  | { type: 'ANOMALY'; payload: LayoutAnomaly }
  | { type: 'RECOVERY_START'; payload: RecoveryAction }
  | { type: 'RECOVERY_SUCCESS'; payload: RecoveryAction }
  | { type: 'RECOVERY_FAILURE'; payload: { action: RecoveryAction; error: Error } };

// AI autofix types (future feature)
export interface AutofixSuggestion {
  id: string;
  type: 'css' | 'js' | 'html' | 'component';
  description: string;
  confidence: number;
  code?: string;
  action?: () => void | Promise<void>;
}

export interface AutofixConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  onSuggestion?: (suggestion: AutofixSuggestion) => void;
}

// Auto-correct types
export interface AutoCorrectConfig {
  enabled: boolean;
  whitePageDetection: {
    enabled: boolean;
    threshold: number;
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