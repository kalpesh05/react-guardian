import React, { Component, ErrorInfo } from 'react';
import { SmartBoundaryProps, GuardianError, RecoveryAction } from './types';
import { useGuardianContext } from './GuardianProvider';

// Default fallback component
const DefaultFallback: React.FC<{ error: GuardianError; retry: () => void }> = ({ error, retry }) => (
  <div style={{
    padding: '20px',
    border: '1px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#fff5f5',
    color: '#d63031',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Something went wrong</h3>
    <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
      {error.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={retry}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Try Again
    </button>
  </div>
);

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error?: GuardianError;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

// Smart boundary class component
class SmartBoundaryClass extends Component<SmartBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: SmartBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        metadata: {
          componentName: 'SmartBoundary'
        }
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const guardianError: GuardianError = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorBoundary: this.props.name || 'SmartBoundary',
      metadata: {
        errorBoundary: this.props.name,
        isolate: this.props.isolate
      }
    };

    this.setState({ error: guardianError, errorInfo });

    // Report error to guardian context if available
    if (this.props.onError) {
      this.props.onError(guardianError);
    }

    // Attempt smart recovery
    this.attemptSmartRecovery(guardianError);
  }

  componentDidUpdate(prevProps: SmartBoundaryProps) {
    // Reset error state if children change (new component tree)
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private attemptSmartRecovery(error: GuardianError) {
    // Smart recovery logic based on error type
    const recoveryActions = this.getSmartRecoveryActions(error);
    
    if (recoveryActions.length > 0) {
      const action = recoveryActions[0]; // Try the first suggested action
      this.executeRecoveryAction(action);
    }
  }

  private getSmartRecoveryActions(error: GuardianError): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Network-related errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      actions.push({
        strategy: 'retry',
        maxRetries: 2
      });
    }

    // Chunk loading errors (common in React apps)
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      actions.push({
        strategy: 'reload'
      });
    }

    // Component-specific errors
    if (error.componentStack) {
      actions.push({
        strategy: 'fallback',
        fallbackComponent: this.props.fallback
      });
    }

    // Default fallback
    if (actions.length === 0) {
      actions.push({
        strategy: 'fallback',
        fallbackComponent: this.props.fallback
      });
    }

    return actions;
  }

  private executeRecoveryAction(action: RecoveryAction) {
    if (this.props.onRecovery) {
      this.props.onRecovery(action);
    }

    switch (action.strategy) {
      case 'retry':
        this.handleRetry(action);
        break;
      case 'reload':
        this.handleReload();
        break;
      case 'fallback':
        // Fallback is handled by rendering the fallback component
        break;
      case 'redirect':
        if (action.redirectUrl) {
          window.location.href = action.redirectUrl;
        }
        break;
      case 'custom':
        if (action.customAction) {
          action.customAction();
        }
        break;
    }
  }

  private handleRetry(action: RecoveryAction) {
    const maxRetries = action.maxRetries || this.maxRetries;
    
    if (this.state.retryCount < maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: prevState.retryCount + 1
        }));
      }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  private handleReload() {
    // Soft reload
    window.location.reload();
  }

  private handleRetryClick = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.handleRetryClick}
        />
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for easier integration
export const SmartBoundary: React.FC<SmartBoundaryProps> = (props) => {
  return <SmartBoundaryClass {...props} />;
};

// Higher-order component for wrapping components
export function withSmartBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<SmartBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <SmartBoundary {...boundaryProps}>
      <Component {...props} />
    </SmartBoundary>
  );

  WrappedComponent.displayName = `withSmartBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Utility hook for manual error reporting
export const useErrorReporting = () => {
  const guardianContext = useGuardianContext();

  const reportError = (error: Error, context?: any) => {
    const guardianError: GuardianError = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: context
    };

    guardianContext.reportError(guardianError);
  };

  return { reportError };
};
