/**
 * グリッドシステムの定数定義
 */

// グリッドレイアウト
export const HOUR_HEIGHT = 72; // 1時間の高さ(px)
export const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2; // 30分の高さ(px)
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // 1分の高さ(px)

// イベント表示
export const MIN_EVENT_HEIGHT = 20; // イベントの最小高さ(px)
export const EVENT_HORIZONTAL_PADDING = 4; // イベントの左右パディング(px)
export const EVENT_VERTICAL_PADDING = 2; // イベントの上下パディング(px)

// 時間列
export const TIME_COLUMN_WIDTH = 48; // 時間列の幅(px)
export const TIME_LABEL_HEIGHT = HOUR_HEIGHT; // 時間ラベルの高さ(px)

// グリッド線のスタイル（セマンティックトークン）
export const HOUR_LINE_COLOR = 'border-border';
export const HALF_HOUR_LINE_COLOR = 'border-border/50'; // より薄い線用

// 現在時刻線
export const CURRENT_TIME_LINE_COLOR = 'bg-blue-500';
export const CURRENT_TIME_DOT_SIZE = 8; // 現在時刻のドットサイズ(px)

// イベント配置
export const MAX_EVENT_COLUMNS = 3; // 同時間帯の最大列数
export const EVENT_GAP = 2; // イベント間の隙間(px)

// アニメーション
export const TRANSITION_DURATION = 150; // トランジション時間(ms)

// スクロール
export const SCROLL_TO_HOUR = 8; // 初期表示時にスクロールする時間（8時）
export const SCROLL_BEHAVIOR = 'smooth' as const;

// カラー（セマンティックトークン）
export const GRID_BACKGROUND = 'bg-background';
export const GRID_BORDER = 'border-border';

// Z-index層
export const Z_INDEX = {
  GRID_LINES: 0,
  EVENTS: 10,
  CURRENT_TIME: 20,
  DRAGGING: 30,
  POPOVER: 40,
  MODAL: 50,
} as const;
