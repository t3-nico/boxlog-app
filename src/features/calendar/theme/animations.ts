// features/calendar/theme/animations.ts
// カレンダー専用のアニメーション定義（Tailwindクラスベース）

import { appear, hover, transition } from '@/config/theme'

export interface CalendarAnimations {
  pulse: string
  slideIn: string
  fadeIn: string
  ghostAppear: string
  placeholderPulse: string
  dragScale: string
  dropZone: string
}

// カレンダー専用アニメーション（既存テーマシステム準拠）
export const calendarAnimations: CalendarAnimations = {
  // 衝突・警告時の点滅（既存のfeedback.pulse使用）
  pulse: 'animate-pulse',
  
  // イベント作成時のスライドイン（既存のappear.slideUp使用）
  slideIn: appear.slideUp,
  
  // フェードイン表示（既存のappear.fadeIn使用）
  fadeIn: appear.fadeIn,
  
  // ゴースト表示（カスタム：薄く表示）
  ghostAppear: 'opacity-30 transition-opacity duration-200',
  
  // プレースホルダーの脈動（カスタム：ゆっくりした点滅）
  placeholderPulse: 'animate-pulse opacity-50',
  
  // ドラッグ時のスケール（既存のhover.scale使用）
  dragScale: `${hover.scale} ${transition.default}`,
  
  // ドロップゾーンのハイライト（カスタム）
  dropZone: 'ring-2 ring-blue-400 ring-opacity-50 transition-all duration-150'
} as const