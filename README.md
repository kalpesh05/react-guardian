# React Guardian 🛡️

A comprehensive React error boundary and monitoring package with automatic DOM/layout anomaly detection, smart recovery, and event reporting.

## Features

- 🚨 **Smart Error Boundaries** - Catch and handle React errors gracefully
- 🔍 **Automatic Layout Monitoring** - Detect DOM/layout anomalies in real-time
- 🔄 **Smart Recovery Engine** - Automatic retry, fallback, and recovery strategies
- 🛠️ **Auto-Correct System** - Automatically fix white pages, page breaks, and layout issues
- 📊 **Event Reporting** - Send errors and anomalies to your backend
- 🎯 **Performance Monitoring** - Track performance issues automatically
- 🔧 **TypeScript Support** - Full TypeScript support with comprehensive types
- 🎨 **Customizable** - Highly configurable with custom fallback components

## Installation

```bash
npm install react-guardian
# or
yarn add react-guardian
```

## Quick Reference

| Feature | Component/Hook | Use Case |
|---------|----------------|----------|
| **Error Boundaries** | `<SmartBoundary>` | Catch React errors |
| **Global Monitoring** | `<GuardianProvider>` | Setup monitoring |
| **Error Reporting** | `useGuardian()` | Manual error reporting |
| **Layout Monitoring** | `useLayoutMonitoring()` | Detect layout issues |
| **Auto-Correct** | `useAutoCorrect()` | Fix white pages & breaks |
| **Recovery** | `useRecovery()` | Handle failed operations |
| **Performance** | `usePerformanceMonitoring()` | Track performance |
| **HOC** | `withSmartBoundary()` | Wrap components |

## Quick Start

### 1. Wrap your app with GuardianProvider

```tsx
import React from 'react';
import { GuardianProvider } from 'react-guardian';

function App() {
  return (
    <GuardianProvider
      reporter={{
        endpoint: 'https://your-api.com/errors',
        apiKey: 'your-api-key'
      }}
      onError={(error) => console.log('Error caught:', error)}
      onAnomaly={(anomaly) => console.log('Layout anomaly:', anomaly)}
      autoCorrect={{
        enabled: true,
        whitePageDetection: { enabled: true, threshold: 0.3 },
        pageBreakDetection: { enabled: true, selectors: ['main', '.content'] },
        visualHealing: { enabled: true, strategies: ['reload-component', 'fix-layout'] }
      }}
      onAutoCorrect={(action) => console.log('Auto-correct applied:', action)}
    >
      <YourApp />
    </GuardianProvider>
  );
}
```

### 2. Add SmartBoundary to catch errors

```tsx
import { SmartBoundary } from 'react-guardian';

function MyComponent() {
  return (
    <SmartBoundary
      name="MyComponent"
      fallback={({ error, retry }) => (
        <div>
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      <RiskyComponent />
    </SmartBoundary>
  );
}
```

### 3. Use hooks for manual monitoring

```tsx
import { useGuardian, useLayoutMonitoring, useAutoCorrect } from 'react-guardian';

function MyComponent() {
  const { reportError } = useGuardian();
  const { monitorElement } = useLayoutMonitoring();
  const { autoCorrectCount, triggerWhitePageFix } = useAutoCorrect();

  const handleAsyncOperation = async () => {
    try {
      await riskyAsyncOperation();
    } catch (error) {
      reportError({
        message: error.message,
        metadata: { operation: 'riskyAsyncOperation' }
      });
    }
  };

  useEffect(() => {
    const element = document.getElementById('my-element');
    if (element) {
      const stopMonitoring = monitorElement(element);
      return stopMonitoring;
    }
  }, []);

  return <div id="my-element">Content</div>;
}
```

## Auto-Correct Features

React Guardian includes powerful auto-correct capabilities to automatically fix common UI issues:

### White Page Detection & Fix
- **Automatic Detection**: Monitors page content ratio to detect white/empty pages
- **Content Restoration**: Restores content from history when available
- **Fallback Injection**: Injects loading content for empty pages
- **Page Reload**: Automatically reloads when content cannot be restored

### Page Break Detection & Fix
- **Layout Monitoring**: Detects elements with unexpected positioning or sizing
- **Automatic Repositioning**: Fixes elements positioned outside viewport
- **Layout Healing**: Applies CSS fixes to broken layouts
- **Component Reloading**: Forces re-render of problematic components

### Visual Healing
- **Invisible Element Fix**: Makes hidden elements visible
- **Overflow Correction**: Fixes elements that overflow viewport
- **Z-Index Issues**: Resolves layering problems
- **Display Issues**: Fixes elements with display: none

### Configuration

```tsx
<GuardianProvider
  autoCorrect={{
    enabled: true,
    whitePageDetection: {
      enabled: true,
      threshold: 0.3,        // Minimum content ratio (30%)
      checkInterval: 5000    // Check every 5 seconds
    },
    pageBreakDetection: {
      enabled: true,
      selectors: ['main', '.content', '#app'],
      minHeight: 100         // Minimum element height
    },
    visualHealing: {
      enabled: true,
      strategies: [
        'reload-component',  // Force component re-render
        'restore-content',   // Restore from history
        'fix-layout',        // Apply CSS fixes
        'inject-fallback',   // Inject fallback content
        'retry-render'       // Retry rendering
      ]
    }
  }}
  onAutoCorrect={(action) => {
    console.log('Auto-correct applied:', action);
    // action.type: 'white-page-fix' | 'page-break-fix' | 'layout-heal' | 'content-restore'
  }}
>
  <YourApp />
</GuardianProvider>
```

### Manual Auto-Correct

```tsx
import { useAutoCorrect } from 'react-guardian';

function MyComponent() {
  const { 
    autoCorrectCount, 
    lastAutoCorrect,
    saveContentSnapshot,
    triggerWhitePageFix,
    triggerPageBreakFix 
  } = useAutoCorrect();

  const handleSaveSnapshot = () => {
    saveContentSnapshot();
  };

  const handleFixWhitePage = () => {
    triggerWhitePageFix();
  };

  const handleFixPageBreak = (element) => {
    triggerPageBreakFix(element);
  };

  return (
    <div>
      <p>Auto-corrects applied: {autoCorrectCount}</p>
      <p>Last action: {lastAutoCorrect?.description}</p>
      <button onClick={handleSaveSnapshot}>Save Snapshot</button>
      <button onClick={handleFixWhitePage}>Fix White Page</button>
    </div>
  );
}
```

## API Reference

### GuardianProvider

The main provider component that sets up error monitoring and reporting.

```tsx
interface GuardianProviderProps {
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
  onError?: (error: GuardianError) => void;
  onAnomaly?: (anomaly: LayoutAnomaly) => void;
  onRecovery?: (action: RecoveryAction) => void;
}
```

### SmartBoundary

A React error boundary with smart recovery capabilities.

```tsx
interface SmartBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: GuardianError; retry: () => void }>;
  onError?: (error: GuardianError) => void;
  onRecovery?: (action: RecoveryAction) => void;
  isolate?: boolean;
  name?: string;
}
```

### Hooks

#### useGuardian

Main hook for accessing Guardian functionality.

```tsx
const {
  reportError,
  reportAnomaly,
  triggerRecovery,
  isRecovering,
  errorCount,
  anomalyCount,
  lastError,
  lastAnomaly
} = useGuardian();
```

#### useErrorReporting

Hook for manual error reporting with utilities.

```tsx
const {
  reportError,
  reportAsyncError,
  reportNetworkError,
  reportValidationError,
  errorCount,
  lastError
} = useErrorReporting();
```

#### useLayoutMonitoring

Hook for layout monitoring and anomaly detection.

```tsx
const {
  checkElementAnomaly,
  monitorElement,
  reportAnomaly,
  anomalyCount,
  lastAnomaly
} = useLayoutMonitoring();
```

#### useRecovery

Hook for recovery management.

```tsx
const {
  retryOperation,
  fallbackToDefault,
  reloadPage,
  redirectTo,
  isRecovering
} = useRecovery();
```

#### usePerformanceMonitoring

Hook for performance monitoring.

```tsx
const {
  measurePerformance,
  measureAsyncPerformance
} = usePerformanceMonitoring();
```

## Configuration

### Reporter Configuration

```tsx
interface ReporterConfig {
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  customReporter?: (error: GuardianError) => void | Promise<void>;
  enabled?: boolean;
}
```

### Layout Watcher Configuration

```tsx
interface LayoutWatcherConfig {
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
```

## Advanced Usage

### Custom Recovery Strategies

```tsx
import { RecoveryEngine } from 'react-guardian';

const recoveryEngine = new RecoveryEngine({
  enabled: true,
  strategies: ['retry', 'fallback', 'reload'],
  maxRetries: 3,
  onRecovery: (action) => {
    console.log('Recovery action:', action);
  }
});

// Get smart recovery suggestions
const suggestions = recoveryEngine.getSmartRecoverySuggestions(error);
```

### Custom Layout Monitoring

```tsx
import { LayoutWatcher } from 'react-guardian';

const layoutWatcher = new LayoutWatcher({
  enabled: true,
  interval: 1000,
  selectors: ['.important-element', '#critical-component'],
  thresholds: {
    overflow: 0.1,
    clipping: 0.1,
    positioning: 0.1
  },
  onAnomaly: (anomaly) => {
    console.log('Layout anomaly detected:', anomaly);
  }
});

layoutWatcher.start();
```

### Custom Error Reporter

```tsx
import { Reporter } from 'react-guardian';

const reporter = new Reporter({
  endpoint: 'https://your-api.com/errors',
  apiKey: 'your-api-key',
  batchSize: 10,
  flushInterval: 5000,
  customReporter: async (error) => {
    // Custom reporting logic
    await fetch('/api/custom-errors', {
      method: 'POST',
      body: JSON.stringify(error)
    });
  }
});
```

## Types

### GuardianError

```tsx
interface GuardianError {
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
```

### LayoutAnomaly

```tsx
interface LayoutAnomaly {
  type: 'overflow' | 'clipping' | 'positioning' | 'sizing' | 'visibility';
  element: Element;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  selector?: string;
  computedStyles?: Record<string, string>;
  boundingRect?: DOMRect;
}
```

### RecoveryAction

```tsx
interface RecoveryAction {
  strategy: 'retry' | 'fallback' | 'reload' | 'redirect' | 'custom';
  fallbackComponent?: ComponentType<any>;
  redirectUrl?: string;
  retryCount?: number;
  maxRetries?: number;
  customAction?: () => void | Promise<void>;
}
```

## Real-World Examples

### 1. Complete App Setup

```tsx
import React from 'react';
import { GuardianProvider, SmartBoundary } from 'react-guardian';

// Custom fallback component
const ErrorFallback = ({ error, retry }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>🚨 Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={retry} style={{ padding: '10px 20px' }}>
      Try Again
    </button>
  </div>
);

function App() {
  return (
    <GuardianProvider
      reporter={{
        endpoint: 'https://api.yourapp.com/errors',
        apiKey: process.env.REACT_APP_ERROR_API_KEY,
        batchSize: 5,
        flushInterval: 10000
      }}
      autoCorrect={{
        enabled: true,
        whitePageDetection: { enabled: true, threshold: 0.3 },
        pageBreakDetection: { 
          enabled: true, 
          selectors: ['main', '.content', '#root'],
          minHeight: 200
        },
        visualHealing: { 
          enabled: true, 
          strategies: ['reload-component', 'fix-layout', 'inject-fallback']
        }
      }}
      onError={(error) => {
        console.error('Error caught:', error);
        // Send to analytics
        analytics.track('error', { message: error.message });
      }}
      onAnomaly={(anomaly) => {
        console.warn('Layout anomaly:', anomaly);
      }}
      onAutoCorrect={(action) => {
        console.log('Auto-correct applied:', action);
      }}
    >
      <SmartBoundary fallback={ErrorFallback}>
        <MyApp />
      </SmartBoundary>
    </GuardianProvider>
  );
}
```

### 2. E-commerce Product Page

```tsx
import { SmartBoundary, useGuardian, useLayoutMonitoring } from 'react-guardian';

const ProductPage = () => {
  const { reportError } = useGuardian();
  const { monitorElement } = useLayoutMonitoring();

  useEffect(() => {
    // Monitor critical product elements
    const productImage = document.getElementById('product-image');
    const priceElement = document.getElementById('product-price');
    
    if (productImage) monitorElement(productImage);
    if (priceElement) monitorElement(priceElement);
  }, []);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId);
    } catch (error) {
      reportError({
        message: 'Failed to add product to cart',
        metadata: { productId, userId, action: 'addToCart' }
      });
    }
  };

  return (
    <div>
      <SmartBoundary name="ProductImage">
        <ProductImage id="product-image" />
      </SmartBoundary>
      
      <SmartBoundary name="ProductPrice">
        <PriceDisplay id="product-price" />
      </SmartBoundary>
      
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};
```

### 3. Dashboard with Multiple Boundaries

```tsx
import { SmartBoundary, useGuardian } from 'react-guardian';

const Dashboard = () => {
  const { reportError, errorCount } = useGuardian();

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        {errorCount > 0 && (
          <div className="error-indicator">
            ⚠️ {errorCount} errors detected
          </div>
        )}
      </header>
      
      <div className="dashboard-grid">
        <SmartBoundary 
          name="UserStats"
          fallback={({ error, retry }) => (
            <div className="widget-error">
              <p>Stats unavailable</p>
              <button onClick={retry}>Retry</button>
            </div>
          )}
        >
          <UserStatsWidget />
        </SmartBoundary>
        
        <SmartBoundary name="RecentActivity">
          <RecentActivityWidget />
        </SmartBoundary>
        
        <SmartBoundary name="Charts">
          <ChartsWidget />
        </SmartBoundary>
      </div>
    </div>
  );
};
```

### 4. Form with Error Handling

```tsx
import { useGuardian, useErrorReporting } from 'react-guardian';

const ContactForm = () => {
  const { reportError } = useGuardian();
  const { reportValidationError, reportNetworkError } = useErrorReporting();
  const [formData, setFormData] = useState({});

  const validateForm = (data) => {
    if (!data.email) {
      reportValidationError('email', data.email, 'required');
      return false;
    }
    if (!data.message) {
      reportValidationError('message', data.message, 'required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) return;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        reportNetworkError('/api/contact', response.status, response);
        return;
      }
      
      // Success
    } catch (error) {
      reportError({
        message: 'Form submission failed',
        metadata: { formData, error: error.message }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <textarea 
        onChange={(e) => setFormData({...formData, message: e.target.value})}
      />
      <button type="submit">Send</button>
    </form>
  );
};
```

### 5. Data Fetching with Recovery

```tsx
import { useRecovery, useGuardian } from 'react-guardian';

const DataComponent = () => {
  const { retryOperation, fallbackToDefault } = useRecovery();
  const { reportError } = useGuardian();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      reportError({
        message: 'Data fetch failed',
        metadata: { endpoint: '/api/data' }
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    retryOperation(fetchData, 3).catch(() => {
      fallbackToDefault();
    });
  };

  useEffect(() => {
    fetchData().catch(() => {
      // Error will be handled by retryOperation
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <button onClick={handleRetry}>Retry</button>;

  return <div>{/* Render data */}</div>;
};
```

### 6. Performance Monitoring

```tsx
import { usePerformanceMonitoring } from 'react-guardian';

const HeavyComponent = () => {
  const { measurePerformance, measureAsyncPerformance } = usePerformanceMonitoring();
  const [data, setData] = useState(null);

  const processLargeDataset = (dataset) => {
    return measurePerformance('data-processing', () => {
      // Heavy computation
      return dataset.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
    });
  };

  const fetchAndProcessData = async () => {
    const result = await measureAsyncPerformance('data-fetch', async () => {
      const response = await fetch('/api/large-dataset');
      return response.json();
    });
    
    const processed = processLargeDataset(result);
    setData(processed);
  };

  return (
    <div>
      <button onClick={fetchAndProcessData}>
        Load Heavy Data
      </button>
      {data && <div>Data loaded: {data.length} items</div>}
    </div>
  );
};
```

### 7. Auto-Correct in Action

```tsx
import { useAutoCorrect } from 'react-guardian';

const AutoCorrectDemo = () => {
  const { 
    autoCorrectCount, 
    lastAutoCorrect,
    saveContentSnapshot,
    triggerWhitePageFix 
  } = useAutoCorrect();

  const simulateWhitePage = () => {
    // Simulate white page by hiding content
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = 'block';
    }, 1000);
  };

  const saveSnapshot = () => {
    saveContentSnapshot();
    alert('Content snapshot saved!');
  };

  return (
    <div>
      <h3>Auto-Correct Demo</h3>
      <p>Auto-corrects applied: {autoCorrectCount}</p>
      {lastAutoCorrect && (
        <p>Last action: {lastAutoCorrect.description}</p>
      )}
      
      <button onClick={saveSnapshot}>
        Save Content Snapshot
      </button>
      <button onClick={triggerWhitePageFix}>
        Trigger White Page Fix
      </button>
      <button onClick={simulateWhitePage}>
        Simulate White Page
      </button>
    </div>
  );
};
```

### 8. Higher-Order Component Usage

```tsx
import { withSmartBoundary } from 'react-guardian';

// Wrap any component with error boundary
const SafeComponent = withSmartBoundary(MyRiskyComponent, {
  name: 'MyRiskyComponent',
  fallback: ({ error, retry }) => (
    <div className="error-fallback">
      <h3>Component Error</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )
});

// Use in your app
function App() {
  return (
    <div>
      <SafeComponent />
      <OtherComponent />
    </div>
  );
}
```

### 9. Custom Error Reporter

```tsx
import { Reporter } from 'react-guardian';

// Custom reporter that sends to multiple services
const customReporter = new Reporter({
  customReporter: async (error) => {
    // Send to Sentry
    Sentry.captureException(error);
    
    // Send to custom API
    await fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        ...error,
        source: 'react-guardian',
        timestamp: Date.now()
      })
    });
    
    // Send to analytics
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      url: error.url
    });
  }
});

// Use in GuardianProvider
<GuardianProvider
  reporter={{
    customReporter: customReporter.report.bind(customReporter)
  }}
>
  <App />
</GuardianProvider>
```

### 10. Production Configuration

```tsx
// Production setup with all features
const ProductionApp = () => {
  return (
    <GuardianProvider
      reporter={{
        endpoint: process.env.REACT_APP_ERROR_ENDPOINT,
        apiKey: process.env.REACT_APP_ERROR_API_KEY,
        batchSize: 10,
        flushInterval: 30000,
        enabled: process.env.NODE_ENV === 'production'
      }}
      recovery={{
        enabled: true,
        strategies: ['retry', 'fallback', 'reload'],
        maxRetries: 3,
        fallbackComponent: DefaultFallback
      }}
      layoutWatcher={{
        enabled: true,
        interval: 5000,
        selectors: ['main', '.content', '[data-critical]'],
        thresholds: {
          overflow: 0.1,
          clipping: 0.1,
          positioning: 0.1
        }
      }}
      autoCorrect={{
        enabled: true,
        whitePageDetection: {
          enabled: true,
          threshold: 0.2,
          checkInterval: 10000
        },
        pageBreakDetection: {
          enabled: true,
          selectors: ['main', '.content', '#app'],
          minHeight: 150
        },
        visualHealing: {
          enabled: true,
          strategies: ['reload-component', 'fix-layout', 'inject-fallback']
        }
      }}
      onError={(error) => {
        // Production error handling
        console.error('Production error:', error);
      }}
      onAnomaly={(anomaly) => {
        // Production anomaly handling
        console.warn('Layout anomaly:', anomaly);
      }}
      onAutoCorrect={(action) => {
        // Production auto-correct logging
        console.log('Auto-correct applied:', action);
      }}
    >
      <SmartBoundary fallback={ProductionFallback}>
        <App />
      </SmartBoundary>
    </GuardianProvider>
  );
};
```

## Basic Examples

### Simple Error Boundary

```tsx
import { SmartBoundary } from 'react-guardian';

function App() {
  return (
    <SmartBoundary>
      <MyApp />
    </SmartBoundary>
  );
}
```

### Advanced Error Boundary with Custom Fallback

```tsx
import { SmartBoundary } from 'react-guardian';

const CustomFallback = ({ error, retry }) => (
  <div className="error-boundary">
    <h2>Oops! Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={retry}>Try Again</button>
  </div>
);

function App() {
  return (
    <SmartBoundary
      fallback={CustomFallback}
      onError={(error) => {
        // Custom error handling
        analytics.track('error', { message: error.message });
      }}
    >
      <MyApp />
    </SmartBoundary>
  );
}
```

### Layout Monitoring

```tsx
import { useLayoutMonitoring } from 'react-guardian';

function MyComponent() {
  const { monitorElement, checkElementAnomaly } = useLayoutMonitoring();

  useEffect(() => {
    const element = document.getElementById('my-element');
    if (element) {
      const stopMonitoring = monitorElement(element, 1000);
      return stopMonitoring;
    }
  }, []);

  return <div id="my-element">Content</div>;
}
```

### Performance Monitoring

```tsx
import { usePerformanceMonitoring } from 'react-guardian';

function MyComponent() {
  const { measurePerformance, measureAsyncPerformance } = usePerformanceMonitoring();

  const handleClick = () => {
    measurePerformance('button-click', () => {
      // Expensive operation
      processData();
    });
  };

  const handleAsyncClick = async () => {
    await measureAsyncPerformance('async-operation', async () => {
      await fetchData();
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Sync Operation</button>
      <button onClick={handleAsyncClick}>Async Operation</button>
    </div>
  );
}
```

## Common Use Cases

### 🛒 E-commerce Applications
- **Product pages**: Monitor product images and pricing elements
- **Shopping cart**: Handle cart errors gracefully
- **Checkout process**: Auto-correct payment form issues
- **Product listings**: Detect and fix layout breaks

### 📊 Dashboard Applications
- **Widget isolation**: Each widget has its own error boundary
- **Data visualization**: Monitor chart rendering
- **Real-time updates**: Handle connection failures
- **User notifications**: Show error states clearly

### 📱 Mobile-First Apps
- **Touch interactions**: Monitor gesture handling
- **Network issues**: Auto-retry failed requests
- **Layout responsiveness**: Fix mobile layout breaks
- **Performance**: Monitor rendering on slower devices

### 🔐 Authentication Systems
- **Login forms**: Handle validation errors
- **Session management**: Auto-recover from expired sessions
- **Permission errors**: Redirect unauthorized users
- **Security events**: Report suspicious activities

### 📝 Content Management
- **Rich text editors**: Handle editor crashes
- **File uploads**: Monitor upload progress
- **Media galleries**: Fix broken image layouts
- **Draft saving**: Auto-save and recover content

### 🎮 Interactive Applications
- **Game states**: Handle game crashes
- **User interactions**: Monitor click/touch events
- **Animation performance**: Detect frame drops
- **Real-time features**: Handle connection issues

## Troubleshooting

### Common Issues

**Q: My errors aren't being reported**
```tsx
// Make sure you have the GuardianProvider at the root
<GuardianProvider
  reporter={{
    endpoint: 'your-endpoint',
    enabled: true  // This is important!
  }}
>
  <App />
</GuardianProvider>
```

**Q: Auto-correct isn't working**
```tsx
// Check your configuration
<GuardianProvider
  autoCorrect={{
    enabled: true,  // Must be explicitly enabled
    whitePageDetection: { enabled: true },
    pageBreakDetection: { enabled: true },
    visualHealing: { enabled: true }
  }}
>
  <App />
</GuardianProvider>
```

**Q: Layout monitoring is too aggressive**
```tsx
// Adjust thresholds
<GuardianProvider
  layoutWatcher={{
    thresholds: {
      overflow: 0.2,      // Increase from 0.1
      clipping: 0.2,      // Increase from 0.1
      positioning: 0.2    // Increase from 0.1
    }
  }}
>
  <App />
</GuardianProvider>
```

**Q: Performance issues with monitoring**
```tsx
// Reduce monitoring frequency
<GuardianProvider
  layoutWatcher={{
    interval: 10000,  // Check every 10 seconds instead of 1
    selectors: ['.critical-only']  // Monitor fewer elements
  }}
>
  <App />
</GuardianProvider>
```

### Best Practices

1. **Start Simple**: Begin with basic error boundaries
2. **Gradual Enhancement**: Add monitoring features incrementally
3. **Test Thoroughly**: Test error scenarios in development
4. **Monitor Performance**: Watch for performance impact
5. **User Experience**: Ensure fallbacks are user-friendly
6. **Error Reporting**: Set up proper error collection
7. **Auto-Correct**: Use sparingly and test thoroughly

### Performance Tips

```tsx
// Optimize for production
<GuardianProvider
  layoutWatcher={{
    enabled: process.env.NODE_ENV === 'production',  // Only in production
    interval: 30000,  // Less frequent checks
    selectors: ['.critical']  // Only critical elements
  }}
  autoCorrect={{
    enabled: process.env.NODE_ENV === 'production',
    whitePageDetection: {
      checkInterval: 15000  // Less frequent checks
    }
  }}
>
  <App />
</GuardianProvider>
```

## Migration Guide

### From react-error-boundary

```tsx
// Before (react-error-boundary)
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={handleError}
>
  <MyApp />
</ErrorBoundary>

// After (react-guardian)
import { SmartBoundary } from 'react-guardian';

<SmartBoundary
  fallback={ErrorFallback}
  onError={handleError}
>
  <MyApp />
</SmartBoundary>
```

### From @sentry/react

```tsx
// Before (Sentry)
import { init } from '@sentry/react';

init({
  dsn: 'your-dsn',
  integrations: [new BrowserTracing()],
});

// After (react-guardian)
import { GuardianProvider } from 'react-guardian';

<GuardianProvider
  reporter={{
    customReporter: (error) => {
      Sentry.captureException(error);
    }
  }}
>
  <MyApp />
</GuardianProvider>
```

### From custom error handling

```tsx
// Before (custom)
class MyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// After (react-guardian)
import { SmartBoundary } from 'react-guardian';

<SmartBoundary
  fallback={({ error, retry }) => (
    <h1>Something went wrong.</h1>
  )}
  onError={(error) => console.error('Error caught:', error)}
>
  {children}
</SmartBoundary>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Your Name](https://github.com/your-username)

## Support

If you have any questions or need help, please open an issue on GitHub.
