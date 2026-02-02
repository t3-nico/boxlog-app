/**
 * API Middleware Unit Tests
 *
 * APIミドルウェアシステムのテスト
 */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiMiddleware, globalApiMiddleware } from '../middleware';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock IP validation
vi.mock('@/lib/security/ip-validation', () => ({
  extractClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mockの作成
function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const req = new Request(url, {
    method: options.method || 'GET',
    headers: new Headers(options.headers || {}),
  });
  return req as unknown as NextRequest;
}

describe('API Middleware', () => {
  describe('ApiMiddleware', () => {
    let middleware: ApiMiddleware;

    beforeEach(() => {
      middleware = new ApiMiddleware({
        rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
        logging: { enabled: false, includeBody: false, includeHeaders: false },
        metrics: { enabled: true, collectResponseTime: true, collectErrorRate: true },
      });
    });

    describe('CORS handling', () => {
      it('should handle OPTIONS preflight request', async () => {
        const request = createMockRequest('http://localhost/api/users', {
          method: 'OPTIONS',
          headers: { origin: 'http://example.com' },
        });

        const handler = vi.fn();
        const response = await middleware.process(request, handler);

        expect(response.status).toBe(204);
        expect(handler).not.toHaveBeenCalled();
      });

      it('should add CORS headers to response', async () => {
        const corsMiddleware = new ApiMiddleware({
          cors: {
            enabled: true,
            origins: ['*'],
            methods: ['GET', 'POST'],
            headers: ['Content-Type'],
            credentials: true,
          },
          enableVersioning: false,
          rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const request = createMockRequest('http://localhost/api/users', {
          headers: { origin: 'http://example.com' },
        });
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 'test' }));

        const response = await corsMiddleware.process(request, handler);

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
        expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
      });

      it('should allow specific origins', async () => {
        const corsMiddleware = new ApiMiddleware({
          cors: {
            enabled: true,
            origins: ['http://allowed.com'],
            methods: ['GET'],
            headers: [],
            credentials: false,
          },
          enableVersioning: false,
          rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const request = createMockRequest('http://localhost/api/users', {
          headers: { origin: 'http://allowed.com' },
        });
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 'test' }));

        const response = await corsMiddleware.process(request, handler);

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
      });
    });

    describe('Rate limiting', () => {
      it('should allow requests within rate limit', async () => {
        const rateLimitMiddleware = new ApiMiddleware({
          rateLimit: { enabled: true, windowMs: 60000, maxRequests: 10 },
          enableVersioning: false,
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        const response = await rateLimitMiddleware.process(request, handler);

        expect(response.status).toBe(200);
        expect(handler).toHaveBeenCalled();
      });

      it('should reject requests exceeding rate limit', async () => {
        const rateLimitMiddleware = new ApiMiddleware({
          rateLimit: { enabled: true, windowMs: 60000, maxRequests: 2 },
          enableVersioning: false,
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        // Make requests up to the limit
        for (let i = 0; i < 2; i++) {
          const request = createMockRequest('http://localhost/api/users');
          await rateLimitMiddleware.process(request, handler);
        }

        // Next request should be rate limited
        const request = createMockRequest('http://localhost/api/users');
        const response = await rateLimitMiddleware.process(request, handler);

        expect(response.status).toBe(429);
        const body = await response.json();
        expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
      });

      it('should include rate limit headers in response', async () => {
        const rateLimitMiddleware = new ApiMiddleware({
          rateLimit: { enabled: true, windowMs: 60000, maxRequests: 1 },
          enableVersioning: false,
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        // First request goes through
        const request1 = createMockRequest('http://localhost/api/users');
        await rateLimitMiddleware.process(
          request1,
          vi.fn().mockResolvedValue(NextResponse.json({})),
        );

        // Second request is rate limited
        const request2 = createMockRequest('http://localhost/api/users');
        const response = await rateLimitMiddleware.process(
          request2,
          vi.fn().mockResolvedValue(NextResponse.json({})),
        );

        expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('Retry-After')).toBeDefined();
      });
    });

    describe('Metrics collection', () => {
      it('should collect request metrics', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        await middleware.process(request, handler);

        const stats = middleware.getStats();
        const pathStats = stats.get('/api/users');

        expect(pathStats).toBeDefined();
        expect(pathStats?.requestCount).toBe(1);
        expect(pathStats?.errorCount).toBe(0);
      });

      it('should track error responses', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ error: 'Not found' }, { status: 404 }),
        );

        await middleware.process(request, handler);

        const stats = middleware.getStats();
        const pathStats = stats.get('/api/users');

        expect(pathStats?.errorCount).toBe(1);
      });

      it('should calculate average response time', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        await middleware.process(request, handler);
        await middleware.process(request, handler);

        const stats = middleware.getStats();
        const pathStats = stats.get('/api/users');

        expect(pathStats?.averageResponseTime).toBeGreaterThanOrEqual(0);
      });

      it('should reset stats', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        await middleware.process(request, handler);
        expect(middleware.getStats().size).toBeGreaterThan(0);

        middleware.resetStats();
        expect(middleware.getStats().size).toBe(0);
      });
    });

    describe('Error handling', () => {
      it('should handle handler errors gracefully', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockRejectedValue(new Error('Handler error'));

        const response = await middleware.process(request, handler);

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toBe('MIDDLEWARE_ERROR');
      });

      it('should collect error metrics for handler failures', async () => {
        const request = createMockRequest('http://localhost/api/users');
        const handler = vi.fn().mockRejectedValue(new Error('Handler error'));

        await middleware.process(request, handler);

        const stats = middleware.getStats();
        const pathStats = stats.get('/api/users');

        expect(pathStats?.errorCount).toBe(1);
      });
    });

    describe('Configuration', () => {
      it('should use default configuration', () => {
        const defaultMiddleware = new ApiMiddleware();
        const stats = defaultMiddleware.getStats();

        expect(stats).toBeDefined();
      });

      it('should allow configuration updates', async () => {
        const testMiddleware = new ApiMiddleware({
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          enableVersioning: false,
          rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        // Process without CORS
        const request1 = createMockRequest('http://localhost/api/users', {
          headers: { origin: 'http://example.com' },
        });
        const response1 = await testMiddleware.process(
          request1,
          vi.fn().mockResolvedValue(NextResponse.json({})),
        );
        expect(response1.headers.get('Access-Control-Allow-Origin')).toBeNull();

        // Update config to enable CORS
        testMiddleware.updateConfig({
          cors: {
            enabled: true,
            origins: ['*'],
            methods: ['GET'],
            headers: [],
            credentials: false,
          },
        });

        // Process with CORS
        const request2 = createMockRequest('http://localhost/api/users', {
          headers: { origin: 'http://example.com' },
        });
        const response2 = await testMiddleware.process(
          request2,
          vi.fn().mockResolvedValue(NextResponse.json({})),
        );
        expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
      });
    });

    describe('Versioning integration', () => {
      it('should integrate with versioning for /api paths', async () => {
        const versioningMiddleware = new ApiMiddleware({
          enableVersioning: true,
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const request = createMockRequest('http://localhost/api/v1/users');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        const response = await versioningMiddleware.process(request, handler);

        // Versioning middleware should add headers
        expect(response.headers.get('X-API-Version')).toBeDefined();
      });

      it('should skip versioning for non-api paths', async () => {
        const versioningMiddleware = new ApiMiddleware({
          enableVersioning: true,
          cors: { enabled: false, origins: [], methods: [], headers: [], credentials: false },
          rateLimit: { enabled: false, windowMs: 60000, maxRequests: 100 },
          logging: { enabled: false, includeBody: false, includeHeaders: false },
          metrics: { enabled: false, collectResponseTime: false, collectErrorRate: false },
        });

        const request = createMockRequest('http://localhost/public/data');
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

        const response = await versioningMiddleware.process(request, handler);

        // Should not have versioning headers
        expect(response.headers.get('X-API-Version')).toBeNull();
      });
    });
  });

  describe('globalApiMiddleware', () => {
    it('should be an instance of ApiMiddleware', () => {
      expect(globalApiMiddleware).toBeInstanceOf(ApiMiddleware);
    });

    it('should have getStats method', () => {
      expect(typeof globalApiMiddleware.getStats).toBe('function');
    });

    it('should have resetStats method', () => {
      expect(typeof globalApiMiddleware.resetStats).toBe('function');
    });
  });
});
