// features/calendar/theme/styles.ts
// カレンダー専用のスタイル定義（Tailwindクラスベース）

// import { spacing } from '@/config/theme' // 削除：直接Tailwindクラスを使用

export interface CalendarStyles {
  event: {
    borderRadius: string
    padding: string
    fontSize: {
      title: string
      time: string
      duration: string
    }
    minHeight: string
    shadow: {
      default: string
      hover: string
      dragging: string
    }
  }

  grid: {
    hourHeight: string // 1時間の高さ（Tailwindクラス）
    columnMinWidth: string // 列の最小幅
    gap: string // グリッドの間隔
  }

  transitions: {
    default: string
    drag: string
    resize: string
  }

  // 統合：calendar-layout.cssからの移行
  scrollbar: {
    custom: string
    touchOptimized: string
    performance: string
  }

  print: {
    hiddenClasses: string[]
    colorClasses: string[]
    layoutClasses: string[]
  }

  layout: {
    scrollbar: string
    touchOptimized: string
    performance: string
  }
}

// カレンダー専用スタイル（既存テーマシステム準拠）
export const calendarStyles: CalendarStyles = {
  event: {
    // 角丸 - rounded.component.card準拠
    borderRadius: 'rounded-md',

    // 余白 - 8pxグリッド準拠
    padding: 'p-2', // 8px

    // フォントサイズ
    fontSize: {
      title: 'text-sm', // 14px
      time: 'text-xs', // 12px
      duration: 'text-xs', // 12px（小さめ）
    },

    // 最小高さ（8pxグリッドに合わせて）
    minHeight: 'min-h-[32px]', // 32px = 8px * 4

    // 影（elevation準拠）
    shadow: {
      default: 'shadow-sm', // 通常時
      hover: 'shadow-md', // ホバー時
      dragging: 'shadow-lg', // ドラッグ時
    },
  },

  grid: {
    // 1時間の高さ（8pxグリッド準拠：60px = 8px * 7.5 ≒ h-15）
    hourHeight: 'h-15', // 60px相当

    // 列の最小幅
    columnMinWidth: 'min-w-[120px]',

    // グリッドの間隔（8pxグリッド準拠）
    gap: 'gap-px', // 1px
  },

  transitions: {
    // デフォルトトランジション（既存animations準拠）
    default: 'transition-all duration-200 ease-in-out',

    // ドラッグトランジション（滑らかな動き）
    drag: 'transition-transform duration-300 ease-out',

    // リサイズトランジション
    resize: 'transition-all duration-200 ease-in-out',
  },

  // スクロールバースタイル
  scrollbar: {
    custom:
      'scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-white dark:scrollbar-track-gray-900/30 dark:scrollbar-thumb-gray-500/40',
    touchOptimized: 'touch-pan-y overflow-auto',
    performance: 'transform-gpu will-change-scroll backface-visibility-hidden',
  },

  // 統合：calendar-layout.cssからの移行（重複を避けてレイアウト専用に）
  layout: {
    // カスタムスクロールバー（Tailwindクラス組み合わせ）
    scrollbar:
      'scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-white dark:scrollbar-track-gray-900/30 dark:scrollbar-thumb-gray-500/40',

    // タッチデバイス最適化
    touchOptimized: 'touch-pan-y overflow-auto',

    // パフォーマンス最適化
    performance: 'transform-gpu will-change-scroll backface-visibility-hidden',
  },

  print: {
    // 印刷時に非表示にするクラス
    hiddenClasses: ['print:hidden', 'print:scrollbar-none'],

    // 印刷時の色調整
    colorClasses: ['print:text-black', 'print:bg-white'],

    // 印刷時のレイアウト調整
    layoutClasses: [
      'print:overflow-visible',
      'print:h-auto',
      'print:static',
      'print:block',
      'print:transform-none',
      'print:page-break-inside-avoid',
    ],
  },
} as const

// カスタムCSS変数とキーフレームアニメーション（globals.cssに追加する場合）
export const calendarCustomCSS = `
/* Calendar Custom Animations - calendar-layout.cssから移行 */
@keyframes calendar-zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes calendar-zoom-out {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes calendar-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Custom Scrollbar for browsers without Tailwind scrollbar plugin */
.calendar-custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.calendar-custom-scrollbar::-webkit-scrollbar-track {
  background: #ffffff;
  border-radius: 4px;
}

.calendar-custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(115, 115, 115, 0.5);
  border-radius: 4px;
}

.calendar-custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(115, 115, 115, 0.7);
}

/* Dark mode scrollbar */
[data-theme="dark"] .calendar-custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(23, 23, 23, 0.3);
}

[data-theme="dark"] .calendar-custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(82, 82, 82, 0.4);
}

[data-theme="dark"] .calendar-custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(82, 82, 82, 0.6);
}

/* Firefox support */
.calendar-custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(115, 115, 115, 0.5) #ffffff;
}

[data-theme="dark"] .calendar-custom-scrollbar {
  scrollbar-color: rgba(82, 82, 82, 0.4) rgba(23, 23, 23, 0.3);
}

/* Print styles */
@media print {
  .scrollbar-thin {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    display: none !important;
  }
}
`
