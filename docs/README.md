# React Guardian Documentation

Welcome to the React Guardian documentation! This directory contains comprehensive documentation for the React Guardian package.

## 📚 Documentation Structure

- **[Getting Started](./getting-started.md)** - Quick start guide
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Examples](./examples.md)** - Code examples and use cases
- **[Configuration](./configuration.md)** - Configuration options
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Migration Guide](./migration.md)** - Migrating from other libraries
- **[Contributing](./contributing.md)** - How to contribute

## 🚀 Quick Links

- [Installation](./getting-started.md#installation)
- [Basic Usage](./getting-started.md#basic-usage)
- [API Reference](./api-reference.md)
- [Examples](./examples.md)
- [Configuration](./configuration.md)

## 📖 What is React Guardian?

React Guardian is a comprehensive React error boundary and monitoring package that provides:

- **Smart Error Boundaries** - Catch and handle React errors gracefully
- **Automatic Layout Monitoring** - Detect DOM/layout anomalies in real-time
- **Smart Recovery Engine** - Automatic retry, fallback, and recovery strategies
- **Auto-Correct System** - Automatically fix white pages, page breaks, and layout issues
- **Event Reporting** - Send errors and anomalies to your backend
- **Performance Monitoring** - Track performance issues automatically
- **TypeScript Support** - Full TypeScript support with comprehensive types

## 🎯 Key Features

### Error Boundaries
- Catch React errors and display fallback UI
- Smart recovery strategies
- Custom fallback components
- Error reporting and analytics

### Layout Monitoring
- Real-time DOM anomaly detection
- Overflow, clipping, and positioning checks
- Configurable thresholds and selectors
- Performance-optimized monitoring

### Auto-Correct
- White page detection and fix
- Page break detection and repair
- Visual healing for broken layouts
- Content restoration from history

### Performance Monitoring
- Track operation performance
- Detect long tasks and layout shifts
- Performance metrics and analytics
- Automatic performance reporting

## 📦 Installation

```bash
npm install react-guardian
# or
yarn add react-guardian
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { GuardianProvider, SmartBoundary } from 'react-guardian';

function App() {
  return (
    <GuardianProvider
      reporter={{
        endpoint: 'https://your-api.com/errors',
        apiKey: 'your-api-key'
      }}
      autoCorrect={{
        enabled: true,
        whitePageDetection: { enabled: true, threshold: 0.3 },
        pageBreakDetection: { enabled: true, selectors: ['main', '.content'] },
        visualHealing: { enabled: true, strategies: ['reload-component', 'fix-layout'] }
      }}
    >
      <SmartBoundary fallback={({ error, retry }) => (
        <div>
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}>
        <YourApp />
      </SmartBoundary>
    </GuardianProvider>
  );
}
```

## 📖 Documentation Pages

### Getting Started
- [Installation](./getting-started.md#installation)
- [Basic Usage](./getting-started.md#basic-usage)
- [Configuration](./getting-started.md#configuration)
- [First Steps](./getting-started.md#first-steps)

### API Reference
- [GuardianProvider](./api-reference.md#guardianprovider)
- [SmartBoundary](./api-reference.md#smartboundary)
- [Hooks](./api-reference.md#hooks)
- [Types](./api-reference.md#types)

### Examples
- [Basic Error Boundary](./examples.md#basic-error-boundary)
- [E-commerce Application](./examples.md#e-commerce-application)
- [Dashboard with Monitoring](./examples.md#dashboard-with-monitoring)
- [Form Error Handling](./examples.md#form-error-handling)
- [Performance Monitoring](./examples.md#performance-monitoring)

### Configuration
- [Reporter Configuration](./configuration.md#reporter-configuration)
- [Layout Watcher Configuration](./configuration.md#layout-watcher-configuration)
- [Auto-Correct Configuration](./configuration.md#auto-correct-configuration)
- [Performance Configuration](./configuration.md#performance-configuration)

### Troubleshooting
- [Common Issues](./troubleshooting.md#common-issues)
- [Performance Problems](./troubleshooting.md#performance-problems)
- [Configuration Issues](./troubleshooting.md#configuration-issues)
- [Debugging](./troubleshooting.md#debugging)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./contributing.md) for details.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- [GitHub Issues](https://github.com/your-username/react-guardian/issues)
- [Discussions](https://github.com/your-username/react-guardian/discussions)
- [Documentation](./README.md)
