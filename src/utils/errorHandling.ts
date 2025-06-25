/**
 * Comprehensive error handling system for debugging and production
 * Designed to be Claude-debuggable with detailed context and stack traces
 */

export interface ErrorContext {
  /** Component or module where error occurred */
  source: string;
  /** Function or method name */
  function: string;
  /** User action that triggered the error */
  userAction?: string;
  /** Relevant data at time of error */
  data?: Record<string, any>;
  /** Current application state */
  appState?: Record<string, any>;
  /** Browser/environment info */
  environment?: {
    userAgent: string;
    url: string;
    timestamp: string;
    viewport: { width: number; height: number };
  };
}

export class AppError extends Error {
  public readonly context: ErrorContext;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly errorId: string;
  public readonly timestamp: Date;
  public readonly originalError?: Error;

  constructor(
    message: string,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.context = context;
    this.severity = severity;
    this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Get Claude-friendly debug information
   */
  getDebugInfo(): string {
    const lines = [
      `🔴 AppError [${this.errorId}] - ${this.severity.toUpperCase()}`,
      `📍 Location: ${this.context.source} -> ${this.context.function}`,
      `💬 Message: ${this.message}`,
      `⏰ Time: ${this.timestamp.toISOString()}`,
    ];

    if (this.context.userAction) {
      lines.push(`👤 User Action: ${this.context.userAction}`);
    }

    if (this.context.data) {
      lines.push(`📊 Context Data: ${JSON.stringify(this.context.data, null, 2)}`);
    }

    if (this.context.appState) {
      lines.push(`🏠 App State: ${JSON.stringify(this.context.appState, null, 2)}`);
    }

    if (this.originalError) {
      lines.push(`🔗 Original Error: ${this.originalError.name}: ${this.originalError.message}`);
      if (this.originalError.stack) {
        lines.push(`📚 Original Stack: ${this.originalError.stack}`);
      }
    }

    if (this.stack) {
      lines.push(`📚 Stack Trace: ${this.stack}`);
    }

    return lines.join('\n');
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.severity) {
      case 'low':
        return 'Something minor went wrong, but you can continue using the app.';
      case 'medium':
        return 'We encountered an issue. Please try again or refresh the page.';
      case 'high':
        return 'An error occurred that may affect app functionality. Please refresh the page.';
      case 'critical':
        return 'A critical error occurred. Please refresh the page and contact support if the issue persists.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

/**
 * Global error handler for unhandled errors
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log an AppError
   */
  handleError(error: AppError): void {
    // Log to console with full debug info
    console.error(error.getDebugInfo());

    // Add to error log
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Send to external error tracking (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(error);
    }

    // Show user-friendly message for high/critical errors
    if (error.severity === 'high' || error.severity === 'critical') {
      this.showUserNotification(error);
    }
  }

  /**
   * Handle native JavaScript errors
   */
  handleNativeError(error: Error, context: Partial<ErrorContext>): AppError {
    const appError = new AppError(
      error.message,
      {
        source: context.source || 'unknown',
        function: context.function || 'unknown',
        userAction: context.userAction,
        data: context.data,
        appState: context.appState,
        environment: this.getEnvironmentInfo(),
      },
      'high',
      error
    );

    this.handleError(appError);
    return appError;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Get Claude-friendly debug summary
   */
  getDebugSummary(): string {
    if (this.errorLog.length === 0) {
      return '✅ No recent errors logged';
    }

    const lines = [
      `🔍 Error Debug Summary (${this.errorLog.length} total errors)`,
      '='.repeat(50),
    ];

    this.errorLog.slice(0, 5).forEach((error, index) => {
      lines.push(`\n${index + 1}. ${error.getDebugInfo()}`);
      lines.push('-'.repeat(30));
    });

    return lines.join('\n');
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    console.log('🧹 Error log cleared');
  }

  private getEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private sendToErrorTracking(error: AppError): void {
    // In production, send to error tracking service
    // For now, just log
    console.warn('📤 Would send to error tracking:', error.errorId);
  }

  private showUserNotification(error: AppError): void {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 16px;
      border-radius: 8px;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">Error ${error.errorId}</div>
      <div>${error.getUserMessage()}</div>
      <button onclick="this.parentElement.remove()" style="
        background: none; border: none; color: #c33; 
        float: right; margin-top: 8px; cursor: pointer;
        font-size: 18px; line-height: 1;
      ">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
}

/**
 * Convenience function to create and handle errors
 */
export const createError = (
  message: string,
  context: ErrorContext,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): AppError => {
  const error = new AppError(message, context, severity);
  ErrorHandler.getInstance().handleError(error);
  return error;
};

/**
 * Wrapper for handling async operations with error catching
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    const appError = ErrorHandler.getInstance().handleNativeError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw appError;
  }
};

// Note: withErrorBoundary is available but not exported due to React import complexity
// Use it in individual component files that already import React

// Global error handler setup
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    ErrorHandler.getInstance().handleNativeError(event.error, {
      source: 'window',
      function: 'global',
      userAction: 'page interaction',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.getInstance().handleNativeError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {
        source: 'window',
        function: 'promise',
        userAction: 'async operation',
      }
    );
  });
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Claude debugging helpers
declare global {
  interface Window {
    debugErrors: () => void;
    clearErrors: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.debugErrors = () => {
    console.log(errorHandler.getDebugSummary());
  };
  
  window.clearErrors = () => {
    errorHandler.clearErrorLog();
  };
}