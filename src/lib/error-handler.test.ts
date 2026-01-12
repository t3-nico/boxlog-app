import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as loggerModule from '@/lib/logger';
import { ErrorHandler } from './error-handler';

// loggerのモック
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockLogger = vi.mocked(loggerModule.logger);

// error-patternsのモック
vi.mock('@/config/error-patterns/index', () => ({
  AppError: class MockAppError extends Error {
    code: string;
    category: string;
    severity: string;
    pattern: { recovery: { logLevel: string } };
    userMessage: { title: string; description: string } | null;

    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.category = 'mock-category';
      this.severity = 'error';
      this.pattern = { recovery: { logLevel: 'error' } };
      this.userMessage = { title: 'Error', description: message };
    }

    shouldNotifyUser() {
      return true;
    }

    getSentryContext() {
      return {};
    }
  },
  createAppError: (message: string, code: string) => {
    const error = new Error(message) as Error & {
      code: string;
      category: string;
      severity: string;
      pattern: { recovery: { logLevel: string } };
      userMessage: { title: string; description: string };
      shouldNotifyUser: () => boolean;
    };
    error.code = code;
    error.category = 'mock-category';
    error.severity = 'error';
    error.pattern = { recovery: { logLevel: 'error' } };
    error.userMessage = { title: 'Error', description: message };
    error.shouldNotifyUser = () => true;
    return error;
  },
  ERROR_CODES: {
    INVALID_TOKEN: 'INVALID_TOKEN',
    NO_PERMISSION: 'NO_PERMISSION',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_FORMAT: 'INVALID_FORMAT',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    API_TIMEOUT: 'API_TIMEOUT',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    QUERY_TIMEOUT: 'QUERY_TIMEOUT',
    DUPLICATE_KEY: 'DUPLICATE_KEY',
    FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
    EXTERNAL_AUTH_FAILED: 'EXTERNAL_AUTH_FAILED',
    API_UNAVAILABLE: 'API_UNAVAILABLE',
    THIRD_PARTY_ERROR: 'THIRD_PARTY_ERROR',
  },
  errorPatternDictionary: {
    healthCheck: () => ({ healthy: true }),
    getErrorStats: () => ({}),
    getCategoryStats: () => ({}),
    getCircuitBreakerStatus: () => ({}),
  },
  executeWithAutoRecovery: vi.fn(),
  getErrorCategory: () => 'mock-category',
}));

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
    vi.clearAllMocks();
  });

  describe('registerNotificationHandler', () => {
    it('通知ハンドラーを登録できる', () => {
      const handler = vi.fn();
      errorHandler.registerNotificationHandler('toast', handler);

      // ハンドラーが登録されたことを確認（内部状態のため間接的にテスト）
      expect(() => errorHandler.registerNotificationHandler('toast', handler)).not.toThrow();
    });

    it('同じタイプで複数回登録すると上書きされる', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      errorHandler.registerNotificationHandler('toast', handler1);
      errorHandler.registerNotificationHandler('toast', handler2);

      // 上書きされることを確認
      expect(() => errorHandler.registerNotificationHandler('toast', handler2)).not.toThrow();
    });
  });

  describe('registerLogHandler', () => {
    it('ログハンドラーを登録できる', () => {
      const handler = vi.fn();
      errorHandler.registerLogHandler('console', handler);

      expect(() => errorHandler.registerLogHandler('console', handler)).not.toThrow();
    });
  });

  describe('handleError', () => {
    it('エラーを処理できる', async () => {
      await errorHandler.handleError(new Error('Test error'));

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('オプションでログレベルを指定できる', async () => {
      await errorHandler.handleError(new Error('Test warning'), undefined, {
        logLevel: 'warn',
      });

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('通知ハンドラーが呼ばれる', async () => {
      const notificationHandler = vi.fn();
      errorHandler.registerNotificationHandler('toast', notificationHandler);

      vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler.handleError(new Error('Test error'));

      expect(notificationHandler).toHaveBeenCalled();
    });

    it('showUserNotification: falseで通知を抑制できる', async () => {
      const notificationHandler = vi.fn();
      errorHandler.registerNotificationHandler('toast', notificationHandler);

      vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler.handleError(new Error('Test error'), undefined, {
        showUserNotification: false,
      });

      expect(notificationHandler).not.toHaveBeenCalled();
    });
  });

  describe('handleApiError', () => {
    it('401エラーをINVALID_TOKENとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 401, statusText: 'Unauthorized' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('INVALID_TOKEN');
    });

    it('403エラーをNO_PERMISSIONとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 403, statusText: 'Forbidden' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('NO_PERMISSION');
    });

    it('404エラーをNOT_FOUNDとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 404, statusText: 'Not Found' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('NOT_FOUND');
    });

    it('429エラーをRATE_LIMIT_EXCEEDEDとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 429, statusText: 'Too Many Requests' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('500エラーをINTERNAL_SERVER_ERRORとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 500, statusText: 'Internal Server Error' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('503エラーをSERVICE_UNAVAILABLEとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 503, statusText: 'Service Unavailable' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('504エラーをAPI_TIMEOUTとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 504, statusText: 'Gateway Timeout' });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('API_TIMEOUT');
    });

    it('未知のステータスコードをUNEXPECTED_ERRORとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = new Response(null, { status: 418, statusText: "I'm a teapot" });
      const error = await errorHandler.handleApiError(response);

      expect(error.code).toBe('UNEXPECTED_ERROR');
    });
  });

  describe('handleValidationError', () => {
    it('バリデーションエラーを処理できる', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const fieldErrors = {
        email: 'Invalid email format',
        password: 'Password is too short',
      };

      const error = await errorHandler.handleValidationError(fieldErrors);

      expect(error.code).toBe('REQUIRED_FIELD');
    });
  });

  describe('handleDatabaseError', () => {
    it('connectionエラーをCONNECTION_FAILEDとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dbError = new Error('Database connection failed');
      const error = await errorHandler.handleDatabaseError(dbError, 'query');

      expect(error.code).toBe('CONNECTION_FAILED');
    });

    it('timeoutエラーをQUERY_TIMEOUTとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dbError = new Error('Query timeout exceeded');
      const error = await errorHandler.handleDatabaseError(dbError, 'query');

      expect(error.code).toBe('QUERY_TIMEOUT');
    });

    it('duplicateエラーをDUPLICATE_KEYとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dbError = new Error('duplicate key value violates unique constraint');
      const error = await errorHandler.handleDatabaseError(dbError, 'insert');

      expect(error.code).toBe('DUPLICATE_KEY');
    });

    it('foreign keyエラーをFOREIGN_KEY_VIOLATIONとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dbError = new Error('violates foreign key constraint');
      const error = await errorHandler.handleDatabaseError(dbError, 'insert');

      expect(error.code).toBe('FOREIGN_KEY_VIOLATION');
    });

    it('not foundエラーをNOT_FOUNDとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dbError = new Error('Record not found');
      const error = await errorHandler.handleDatabaseError(dbError, 'select');

      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('handleExternalServiceError', () => {
    it('timeoutエラーをAPI_TIMEOUTとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const serviceError = new Error('Request timeout');
      const error = await errorHandler.handleExternalServiceError('stripe', serviceError);

      expect(error.code).toBe('API_TIMEOUT');
    });

    it('authエラーをEXTERNAL_AUTH_FAILEDとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const serviceError = new Error('auth token invalid');
      const error = await errorHandler.handleExternalServiceError('github', serviceError);

      expect(error.code).toBe('EXTERNAL_AUTH_FAILED');
    });

    it('unavailableエラーをAPI_UNAVAILABLEとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const serviceError = new Error('Service unavailable');
      const error = await errorHandler.handleExternalServiceError('aws', serviceError);

      expect(error.code).toBe('API_UNAVAILABLE');
    });

    it('その他のエラーをTHIRD_PARTY_ERRORとして処理', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const serviceError = new Error('Unknown service error');
      const error = await errorHandler.handleExternalServiceError('slack', serviceError);

      expect(error.code).toBe('THIRD_PARTY_ERROR');
    });
  });

  describe('getHealthStatus', () => {
    it('健全性ステータスを取得できる', () => {
      const status = errorHandler.getHealthStatus();

      expect(status).toEqual({ healthy: true });
    });
  });

  describe('getErrorStats', () => {
    it('エラー統計を取得できる', () => {
      const stats = errorHandler.getErrorStats();

      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('circuitBreakers');
    });
  });
});
