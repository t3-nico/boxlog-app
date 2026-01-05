// features/calendar/theme/colors.ts
// カレンダー専用のカラー定義（Tailwindクラスベース）

// 型定義
export interface CalendarColors {
  event: {
    // ステータス別
    scheduled: ColorSet;
    backlog: ColorSet;
    waiting: ColorSet;
    blocked: ColorSet;
    completed: ColorSet;
    cancelled: ColorSet;

    // タイプ別（将来拡張用）
    task: ColorSet;
    log: ColorSet;
  };

  // UI状態
  states: {
    ghost: ColorSet; // ゴースト表示
    selected: ColorSet; // 選択時
    displayPeriod: ColorSet; // 表示期間
    conflict: ColorSet; // 衝突時
  };
}

interface ColorSet {
  background: string;
  text: string;
  hover?: string;
  active?: string;
}

// カレンダー専用カラー（既存テーマシステム準拠）
export const calendarColors: CalendarColors = {
  event: {
    // scheduled - プライマリー系（セマンティック）
    scheduled: {
      background: 'bg-primary/10',
      text: 'text-primary',
      active: 'bg-primary/20',
    },

    // backlog - セカンダリー系（グレー）
    backlog: {
      background: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      hover: 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      active: 'bg-neutral-300 dark:bg-neutral-600',
    },

    // waiting - 警告系（黄色）
    waiting: {
      background: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-800 dark:text-amber-200',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      active: 'bg-amber-200 dark:bg-amber-800/40',
    },

    // blocked - エラー系（赤）
    blocked: {
      background: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      active: 'bg-red-200 dark:bg-red-800/40',
    },

    // completed - 成功系（緑）
    completed: {
      background: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      active: 'bg-green-200 dark:bg-green-800/40',
    },

    // cancelled - 無効系（コントラスト比改善: 4.5:1以上確保）
    cancelled: {
      background: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      hover: 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      active: 'bg-neutral-300 dark:bg-neutral-600',
    },

    // task - タスク系（セマンティック）
    task: {
      background: 'bg-primary/10',
      text: 'text-primary',
    },

    // log - ログ系（緑ベース）
    log: {
      background: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-700 dark:text-green-300',
    },
  },

  states: {
    // ghost - ゴースト表示（コントラスト比改善: 視認性向上）
    ghost: {
      background: 'bg-neutral-200/50 dark:bg-neutral-700/50',
      text: 'text-neutral-600 dark:text-neutral-400',
    },

    // selected - 選択時（セマンティック、濃い）
    selected: {
      background: 'bg-primary/20',
      text: 'inherit',
    },

    // displayPeriod - 表示期間（セマンティック、薄い）
    displayPeriod: {
      background: 'bg-primary/10',
      text: 'inherit',
    },

    // conflict - 衝突時（薄い赤）
    conflict: {
      background: 'bg-red-50/50 dark:bg-red-950/30',
      text: 'text-red-600 dark:text-red-400',
    },
  },
} as const;
