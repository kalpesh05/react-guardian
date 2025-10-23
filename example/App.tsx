import React, { useState, useEffect } from 'react';
import { 
  GuardianProvider, 
  SmartBoundary, 
  useGuardian, 
  useLayoutMonitoring,
  usePerformanceMonitoring,
  useAutoCorrect
} from 'react-guardian';

// Example component that might throw errors
const RiskyComponent = () => {
  const [count, setCount] = useState(0);
  const { reportError } = useGuardian();
  const { measurePerformance } = usePerformanceMonitoring();

  const handleClick = () => {
    measurePerformance('button-click', () => {
      if (count === 3) {
        throw new Error('Intentional error for demonstration');
      }
      setCount(count + 1);
    });
  };

  const handleAsyncError = async () => {
    try {
      await fetch('/non-existent-endpoint');
    } catch (error) {
      reportError({
        message: 'Network request failed',
        metadata: { endpoint: '/non-existent-endpoint' }
      });
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Risky Component</h3>
      <p>Count: {count}</p>
      <button onClick={handleClick}>
        Click me (will error on 3rd click)
      </button>
      <button onClick={handleAsyncError} style={{ marginLeft: '10px' }}>
        Trigger Async Error
      </button>
    </div>
  );
};

// Example component with layout monitoring
const LayoutComponent = () => {
  const { monitorElement } = useLayoutMonitoring();

  useEffect(() => {
    const element = document.getElementById('monitored-element');
    if (element) {
      const stopMonitoring = monitorElement(element, 1000);
      return stopMonitoring;
    }
  }, []);

  return (
    <div 
      id="monitored-element"
      style={{ 
        padding: '20px', 
        border: '1px solid #ccc', 
        margin: '10px',
        width: '200px',
        height: '100px',
        overflow: 'hidden'
      }}
    >
      <h4>Monitored Element</h4>
      <p>This element is being monitored for layout anomalies.</p>
    </div>
  );
};

// Custom fallback component
const CustomFallback = ({ error, retry }: { error: any; retry: () => void }) => (
  <div style={{
    padding: '20px',
    border: '2px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#fff5f5',
    color: '#d63031',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h3 style={{ margin: '0 0 10px 0' }}>🚨 Error Caught!</h3>
    <p style={{ margin: '0 0 15px 0' }}>
      <strong>Message:</strong> {error.message}
    </p>
    <p style={{ margin: '0 0 15px 0' }}>
      <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
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
      🔄 Try Again
    </button>
  </div>
);

// Main App component
const App = () => {
  const [errorCount, setErrorCount] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [autoCorrectCount, setAutoCorrectCount] = useState(0);

  return (
    <GuardianProvider
      reporter={{
        enabled: true,
        customReporter: (error) => {
          console.log('Error reported:', error);
        }
      }}
      layoutWatcher={{
        enabled: true,
        interval: 2000,
        selectors: ['#monitored-element'],
        thresholds: {
          overflow: 0.1,
          clipping: 0.1,
          positioning: 0.1
        }
      }}
      onError={(error) => {
        setErrorCount(prev => prev + 1);
        console.log('Error caught by Guardian:', error);
      }}
      onAnomaly={(anomaly) => {
        setAnomalyCount(prev => prev + 1);
        console.log('Layout anomaly detected:', anomaly);
      }}
      autoCorrect={{
        enabled: true,
        whitePageDetection: {
          enabled: true,
          threshold: 0.3,
          checkInterval: 3000
        },
        pageBreakDetection: {
          enabled: true,
          selectors: ['main', '.content', '#app'],
          minHeight: 100
        },
        visualHealing: {
          enabled: true,
          strategies: ['reload-component', 'fix-layout', 'inject-fallback']
        }
      }}
      onAutoCorrect={(action) => {
        setAutoCorrectCount(prev => prev + 1);
        console.log('Auto-correct action:', action);
      }}
    >
      <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <h1>🛡️ React Guardian Demo</h1>
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Errors caught:</strong> {errorCount}</p>
          <p><strong>Layout anomalies:</strong> {anomalyCount}</p>
          <p><strong>Auto-corrects applied:</strong> {autoCorrectCount}</p>
        </div>

        <SmartBoundary
          name="RiskyComponent"
          fallback={CustomFallback}
        >
          <RiskyComponent />
        </SmartBoundary>

        <LayoutComponent />

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
          <h4>Instructions:</h4>
          <ul>
            <li>Click the "Click me" button 3 times to trigger an error</li>
            <li>Click "Trigger Async Error" to see async error handling</li>
            <li>Resize the browser window to trigger layout anomalies</li>
            <li>Check the console for detailed logs</li>
          </ul>
        </div>
      </div>
    </GuardianProvider>
  );
};

export default App;
