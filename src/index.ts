// Main exports for react-guardian package

// Core components
export { GuardianProvider, useGuardianContext } from './GuardianProvider';
export { SmartBoundary, withSmartBoundary, useErrorReporting as useErrorReportingFromBoundary } from './SmartBoundary';

// Hooks
export { 
  useGuardian, 
  useErrorReporting, 
  useLayoutMonitoring, 
  useRecovery, 
  usePerformanceMonitoring,
  useAutoCorrect
} from './useGuardian';

// Core classes (for advanced usage)
export { Reporter } from './Reporter';
export { LayoutWatcher } from './LayoutWatcher';
export { RecoveryEngine } from './RecoveryEngine';
export { AutoCorrect } from './AutoCorrect';

// Types
export type {
  GuardianError,
  LayoutAnomaly,
  RecoveryAction,
  RecoveryStrategy,
  ReporterConfig,
  GuardianContextValue,
  GuardianProviderProps,
  SmartBoundaryProps,
  LayoutWatcherConfig,
  RecoveryEngineConfig,
  UseGuardianReturn,
  GuardianEvent,
  AutofixSuggestion,
  AutofixConfig,
  AutoCorrectConfig,
  AutoCorrectAction,
  AutoCorrectStrategy
} from './types';

// Version
export const VERSION = '1.0.0';

// Default export for convenience
export default {
  GuardianProvider,
  SmartBoundary,
  useGuardian,
  useErrorReporting,
  useLayoutMonitoring,
  useRecovery,
  usePerformanceMonitoring,
  useAutoCorrect,
  withSmartBoundary,
  VERSION
};
