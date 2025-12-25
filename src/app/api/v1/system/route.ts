/**
 * 🖥️ API System Information Endpoint (v1.0)
 *
 * システム情報・APIバージョニング詳細情報の提供エンドポイント
 * /api/v1/system で呼び出し
 */

import { NextRequest, NextResponse } from 'next/server';

import { getApiStats } from '@/lib/api/middleware';
import { API_VERSIONS } from '@/lib/api/versioning';

/**
 * 💻 System Information レスポンス型定義
 */
interface SystemInfoResponse {
  api: {
    currentVersion: string;
    supportedVersions: string[];
    deprecatedVersions: string[];
    requestedVersion: string;
    versionSource: 'url' | 'header' | 'default';
  };
  system: {
    nodeVersion: string;
    environment: string;
    timestamp: string;
    timezone: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
  middleware: {
    versioning: boolean;
    rateLimit: boolean;
    cors: boolean;
    logging: boolean;
    metrics: boolean;
  };
  statistics: {
    totalRequests: number;
    endpoints: Array<{
      path: string;
      requestCount: number;
      errorCount: number;
      averageResponseTime: number;
      lastRequest: string;
    }>;
  };
}

/**
 * 📊 GET /api/v1/system - System Information API
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // API統計情報の取得
    const apiStats = getApiStats();
    const statisticsData = Array.from(apiStats.entries()).map(([path, stats]) => ({
      path,
      requestCount: stats.requestCount,
      errorCount: stats.errorCount,
      averageResponseTime: stats.averageResponseTime,
      lastRequest: stats.lastRequest,
    }));

    const systemInfo: SystemInfoResponse = {
      api: {
        currentVersion: API_VERSIONS.CURRENT,
        supportedVersions: [...API_VERSIONS.SUPPORTED],
        deprecatedVersions: [...API_VERSIONS.DEPRECATED],
        requestedVersion: API_VERSIONS.CURRENT,
        versionSource: 'url',
      },
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
      },
      middleware: {
        versioning: true,
        rateLimit: process.env.NODE_ENV === 'production',
        cors: true,
        logging: true,
        metrics: true,
      },
      statistics: {
        totalRequests: statisticsData.reduce((total, endpoint) => total + endpoint.requestCount, 0),
        endpoints: statisticsData,
      },
    };

    return NextResponse.json(systemInfo, { status: 200 });
  } catch (error) {
    console.error('System info API error:', error);
    return NextResponse.json(
      {
        error: 'SYSTEM_INFO_ERROR',
        message: 'Failed to retrieve system information',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
