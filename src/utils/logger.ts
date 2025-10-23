/**
 * Logger utility for React Guardian
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
  onLog?: (entry: LogEntry) => void;
  customLogger?: (level: LogLevel, message: string, context?: any) => void;
}

export class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, { ...context, error });
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.config.enabled || !this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      error: context?.error
    };

    // Use custom logger if provided
    if (this.config.customLogger) {
      this.config.customLogger(level, message, context);
      return;
    }

    // Default console logging
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '[React Guardian]';
    const formattedMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, context);
        break;
      case 'info':
        console.info(formattedMessage, context);
        break;
      case 'warn':
        console.warn(formattedMessage, context);
        break;
      case 'error':
        console.error(formattedMessage, context);
        break;
    }

    // Call onLog callback
    this.config.onLog?.(entry);
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, any>): Logger {
    return new Logger({
      ...this.config,
      onLog: (entry) => {
        this.config.onLog?.({
          ...entry,
          context: { ...entry.context, ...additionalContext }
        });
      }
    });
  }
}
