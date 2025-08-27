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
    hourHeight: string      // 1時間の高さ（Tailwindクラス）
    columnMinWidth: string  // 列の最小幅
    gap: string            // グリッドの間隔
  }
  
  transitions: {
    default: string
    drag: string
    resize: string
  }
}

// カレンダー専用スタイル（既存テーマシステム準拠）
export const calendarStyles: CalendarStyles = {
  event: {
    // 角丸 - rounded.component.card準拠
    borderRadius: 'rounded-md',
    
    // 余白 - 8pxグリッド準拠
    padding: 'p-2',  // 8px
    
    // フォントサイズ
    fontSize: {
      title: 'text-sm',      // 14px
      time: 'text-xs',       // 12px
      duration: 'text-xs'    // 12px（小さめ）
    },
    
    // 最小高さ（8pxグリッドに合わせて）
    minHeight: 'min-h-[32px]',  // 32px = 8px * 4
    
    // 影（elevation準拠）
    shadow: {
      default: 'shadow-sm',          // 通常時
      hover: 'shadow-md',            // ホバー時
      dragging: 'shadow-lg'          // ドラッグ時
    }
  },
  
  grid: {
    // 1時間の高さ（8pxグリッド準拠：60px = 8px * 7.5 ≒ h-15）
    hourHeight: 'h-15',  // 60px相当
    
    // 列の最小幅
    columnMinWidth: 'min-w-[120px]',
    
    // グリッドの間隔（8pxグリッド準拠）
    gap: 'gap-px'  // 1px
  },
  
  transitions: {
    // デフォルトトランジション（既存animations準拠）
    default: 'transition-all duration-200 ease-in-out',
    
    // ドラッグトランジション（滑らかな動き）
    drag: 'transition-transform duration-300 ease-out',
    
    // リサイズトランジション
    resize: 'transition-all duration-200 ease-in-out'
  }
} as const