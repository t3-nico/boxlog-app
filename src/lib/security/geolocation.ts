/**
 * GeoIP Location Service
 *
 * IPアドレスから地理情報を取得
 * 監査ログでの不審なアクセス検出に使用
 *
 * 取得方法（優先順）:
 * 1. Vercelヘッダー（x-vercel-ip-country等）- 追加コストなし
 * 2. フォールバック: ip-api.com（無料枠あり）
 *
 * @see https://vercel.com/docs/edge-network/headers#x-vercel-ip-country
 */

/**
 * 地理情報
 */
export interface GeoLocation {
  /** 国コード（ISO 3166-1 alpha-2） */
  country: string | null;
  /** 国名 */
  countryName: string | null;
  /** 地域/州 */
  region: string | null;
  /** 都市 */
  city: string | null;
  /** タイムゾーン */
  timezone: string | null;
  /** 情報ソース */
  source: 'vercel' | 'api' | 'unknown';
}

/**
 * Vercelヘッダーから地理情報を取得
 */
export function getGeoFromVercelHeaders(headers: Headers): GeoLocation | null {
  const country = headers.get('x-vercel-ip-country');

  if (!country) {
    return null;
  }

  return {
    country,
    countryName: getCountryName(country),
    region: headers.get('x-vercel-ip-country-region'),
    city: headers.get('x-vercel-ip-city'),
    timezone: headers.get('x-vercel-ip-timezone'),
    source: 'vercel',
  };
}

/**
 * 国コードから国名を取得
 */
function getCountryName(code: string): string | null {
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code) ?? null;
  } catch {
    return null;
  }
}

/**
 * IP APIから地理情報を取得（フォールバック）
 *
 * 注意: ip-api.comは商用利用制限あり
 * 本番環境では有料サービス（MaxMind, ipinfo.io等）を推奨
 *
 * @param ip IPアドレス
 */
export async function getGeoFromApi(ip: string): Promise<GeoLocation | null> {
  // プライベートIPやunknownはスキップ
  if (!ip || ip === 'unknown' || isPrivateIpAddress(ip)) {
    return null;
  }

  try {
    // 開発環境ではスキップ（APIコール制限回避）
    if (process.env.NODE_ENV === 'development') {
      return {
        country: 'JP',
        countryName: 'Japan',
        region: 'Tokyo',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        source: 'api',
      };
    }

    // ip-api.com（無料枠: 45リクエスト/分）
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,countryCode,regionName,city,timezone`,
      {
        signal: AbortSignal.timeout(3000), // 3秒タイムアウト
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === 'fail') {
      return null;
    }

    return {
      country: data.countryCode ?? null,
      countryName: data.country ?? null,
      region: data.regionName ?? null,
      city: data.city ?? null,
      timezone: data.timezone ?? null,
      source: 'api',
    };
  } catch {
    // API失敗時は静かに失敗
    return null;
  }
}

/**
 * 地理情報を取得（統合関数）
 *
 * @param headers リクエストヘッダー
 * @param ip IPアドレス（APIフォールバック用）
 */
export async function getGeoLocation(headers: Headers, ip?: string): Promise<GeoLocation> {
  // 1. Vercelヘッダーを優先
  const vercelGeo = getGeoFromVercelHeaders(headers);
  if (vercelGeo) {
    return vercelGeo;
  }

  // 2. APIフォールバック
  if (ip) {
    const apiGeo = await getGeoFromApi(ip);
    if (apiGeo) {
      return apiGeo;
    }
  }

  // 3. 不明
  return {
    country: null,
    countryName: null,
    region: null,
    city: null,
    timezone: null,
    source: 'unknown',
  };
}

/**
 * プライベートIPアドレスかどうかを判定
 */
function isPrivateIpAddress(ip: string): boolean {
  // IPv4プライベート範囲
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^localhost$/i,
  ];

  return privateRanges.some((regex) => regex.test(ip));
}

/**
 * 地理情報を文字列形式で取得（監査ログ用）
 */
export function formatGeoLocation(geo: GeoLocation): string {
  const parts: string[] = [];

  if (geo.city) parts.push(geo.city);
  if (geo.region) parts.push(geo.region);
  if (geo.countryName) parts.push(geo.countryName);

  if (parts.length === 0) {
    return 'Unknown';
  }

  return parts.join(', ');
}
