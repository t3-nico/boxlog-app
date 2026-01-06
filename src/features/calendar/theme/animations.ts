// features/calendar/theme/animations.ts
// カレンダー専用のアニメーション定義（Tailwindクラスベース）

export interface CalendarAnimations {
  pulse: string;
  slideIn: string;
  fadeIn: string;
  ghostAppear: string;
  placeholderPulse: string;
  dragScale: string;
  dropZone: string;
}

// カレンダー専用アニメーション（Tailwind標準クラス使用）
export const calendarAnimations: CalendarAnimations = {
  // 衝突・警告時の点滅
  pulse: 'animate-pulse',

  // イベント作成時のスライドイン
  slideIn: 'animate-in slide-in-from-bottom-2 duration-200',

  // フェードイン表示
  fadeIn: 'animate-in fade-in duration-200',

  // ゴースト表示（カスタム：薄く表示）
  ghostAppear: 'opacity-30 transition-opacity duration-200',

  // プレースホルダーの脈動（カスタム：ゆっくりした点滅）
  placeholderPulse: 'animate-pulse opacity-50',

  // ドラッグ時のスケール
  dragScale: 'scale-105 transition-transform duration-200',

  // ドロップゾーンのハイライト
  dropZone: 'ring-2 ring-primary/50 transition-all duration-150',
} as const;
