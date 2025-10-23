import React from 'react';
import { render, screen } from '@testing-library/react';
import { GuardianProvider, useGuardian } from '../GuardianProvider';

// Test component that uses the guardian context
const TestComponent = () => {
  const { reportError, errorCount } = useGuardian();
  
  return (
    <div>
      <span data-testid="error-count">{errorCount}</span>
      <button 
        onClick={() => reportError({ message: 'Test error', timestamp: Date.now() })}
        data-testid="report-error"
      >
        Report Error
      </button>
    </div>
  );
};

describe('GuardianProvider', () => {
  it('should provide guardian context to children', () => {
    render(
      <GuardianProvider>
        <TestComponent />
      </GuardianProvider>
    );

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should handle error reporting', () => {
    render(
      <GuardianProvider>
        <TestComponent />
      </GuardianProvider>
    );

    const reportButton = screen.getByTestId('report-error');
    reportButton.click();

    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });
});
