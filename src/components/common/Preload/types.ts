// PreloadResources コンポーネントは props を持たないため、型定義は不要
// 将来的に設定可能にする場合はここに追加

export interface PreloadConfig {
  criticalRoutes?: string[];
  fontUrls?: string[];
  enableServiceWorker?: boolean;
}
