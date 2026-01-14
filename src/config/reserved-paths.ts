/**
 * 予約パス一覧
 *
 * @description
 * usernameとして登録できないパス。
 * LP側で使用されるパスや、アプリ側の機能パスを含む。
 *
 * @see docs/decisions/2026-01-13-domain-url-structure.md
 */

/**
 * LP側で使用されるパス
 */
const LP_PATHS = [
  'pricing',
  'about',
  'blog',
  'terms',
  'privacy',
  'contact',
  'features',
  'help',
  'support',
  'changelog',
  'roadmap',
] as const;

/**
 * アプリ側で使用されるパス
 */
const APP_PATHS = [
  'settings',
  'inbox',
  'calendar',
  'stats',
  'auth',
  'login',
  'signup',
  'logout',
  'api',
  'admin',
  'error',
  'offline',
] as const;

/**
 * システム予約パス
 */
const SYSTEM_PATHS = [
  'app-static', // Multi-zones assetPrefix
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
] as const;

/**
 * 一般的に予約すべきパス
 */
const COMMON_RESERVED = [
  'www',
  'mail',
  'email',
  'ftp',
  'admin',
  'root',
  'null',
  'undefined',
  'test',
  'demo',
] as const;

/**
 * すべての予約パス（小文字）
 */
export const RESERVED_PATHS: readonly string[] = [
  ...LP_PATHS,
  ...APP_PATHS,
  ...SYSTEM_PATHS,
  ...COMMON_RESERVED,
];

/**
 * usernameが予約パスかどうかをチェック
 */
export function isReservedPath(username: string): boolean {
  return RESERVED_PATHS.includes(username.toLowerCase());
}

/**
 * usernameのバリデーション
 *
 * @returns エラーメッセージまたはnull（有効な場合）
 */
export function validateUsername(username: string): string | null {
  // 長さチェック
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 30) {
    return 'Username must be 30 characters or less';
  }

  // 文字種チェック（英数字とアンダースコアのみ）
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  // 先頭文字チェック（数字不可）
  if (/^[0-9]/.test(username)) {
    return 'Username cannot start with a number';
  }

  // 予約パスチェック
  if (isReservedPath(username)) {
    return 'This username is not available';
  }

  return null;
}
