interface GameError {
  type: 'api' | 'audio' | 'network' | 'validation' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
}

class ErrorHandler {
  private errors: GameError[] = [];
  private maxErrors = 50;

  handleError(error: GameError): void {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    this.logError(error);
  }

  handleApiError(error: any, context?: string): GameError {
    const apiError: GameError = {
      type: 'api',
      message: error?.message || 'API request failed',
      code: error?.status?.toString() || error?.code,
      details: {
        context,
        status: error?.status,
        statusText: error?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        response: error?.response?.data,
      },
      timestamp: Date.now(),
    };

    this.handleError(apiError);
    return apiError;
  }

  handleAudioError(error: any, context?: string): GameError {
    const audioError: GameError = {
      type: 'audio',
      message: error?.message || 'Audio playback failed',
      code: error?.code,
      details: {
        context,
        soundId: error?.soundId,
        howlError: error?.howlError,
        webAudioError: error?.webAudioError,
      },
      timestamp: Date.now(),
    };

    this.handleError(audioError);
    return audioError;
  }

  handleNetworkError(error: any, context?: string): GameError {
    const networkError: GameError = {
      type: 'network',
      message: error?.message || 'Network connection failed',
      code: error?.code,
      details: {
        context,
        isOnline: navigator.onLine,
        timeout: error?.timeout,
      },
      timestamp: Date.now(),
    };

    this.handleError(networkError);
    return networkError;
  }

  handleValidationError(message: string, details?: any): GameError {
    const validationError: GameError = {
      type: 'validation',
      message,
      details,
      timestamp: Date.now(),
    };

    this.handleError(validationError);
    return validationError;
  }

  private logError(error: GameError): void {
    const logMessage = `[${error.type.toUpperCase()}] ${error.message}`;
    
    switch (error.type) {
      case 'api':
        console.error(logMessage, error.details);
        break;
      case 'audio':
        console.warn(logMessage, error.details);
        break;
      case 'network':
        console.error(logMessage, error.details);
        break;
      case 'validation':
        console.warn(logMessage, error.details);
        break;
      default:
        console.error(logMessage, error.details);
    }
  }

  getRecentErrors(count: number = 10): GameError[] {
    return this.errors.slice(-count);
  }

  clearErrors(): void {
    this.errors = [];
  }

  async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          if ((error as any)?.status === 401 || (error as any)?.code === 401) {
            this.handleApiError(error, context);
          } else if ((error as any)?.name === 'NetworkError' || !navigator.onLine) {
            this.handleNetworkError(error, context);
          } else {
            this.handleError({
              type: 'unknown',
              message: (error as any)?.message || 'Operation failed after retries',
              details: { context, attempt, maxAttempts },
              timestamp: Date.now(),
            });
          }
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }
}

export const errorHandler = new ErrorHandler();
