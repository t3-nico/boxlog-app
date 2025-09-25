/**
 * 機能フラグ管理
 */

export const FEATURE_FLAGS = {
  enableAIChat: true,
  enableSmartFolders: true,
  enableOfflineMode: false,
  enableAnalytics: true,
  enableLifeCounter: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return Object.prototype.hasOwnProperty.call(FEATURE_FLAGS, feature) ? FEATURE_FLAGS[feature] : false
}