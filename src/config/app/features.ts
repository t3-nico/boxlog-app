/**
 * 機能フラグ管理
 */

export const FEATURE_FLAGS = {
  enableAIChat: true,
  enableOfflineMode: false,
  enableAnalytics: true,
  enableLifeCounter: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return (feature as keyof typeof FEATURE_FLAGS) in FEATURE_FLAGS ? FEATURE_FLAGS[feature] : false
}
