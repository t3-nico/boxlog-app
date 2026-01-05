/**
 * 折りたたみセクション関連の型定義
 * クロノタイプの睡眠時間帯を折りたたんで表示するための型
 */

/**
 * 折りたたみ可能な時間セクション
 */
export interface CollapsedSection {
  /** 開始時間（0-23） */
  startHour: number;
  /** 終了時間（0-24） */
  endHour: number;
  /** 元の継続時間（時間） */
  originalDuration: number;
  /** 折りたたまれているか */
  isCollapsed: boolean;
  /** 折りたたみ時の高さ（px） */
  collapsedHeight: number;
  /** 表示ラベル（例: "00:00 - 07:00"） */
  label: string;
}

/**
 * グリッドセクション（通常または折りたたみ）
 */
export interface GridSection {
  /** セクションタイプ */
  type: 'normal' | 'collapsed';
  /** 開始時間（0-23） */
  startHour: number;
  /** 終了時間（0-24） */
  endHour: number;
  /** このセクションの高さ（px） */
  heightPx: number;
  /** グリッド上部からのオフセット（px） */
  offsetPx: number;
  /** 折りたたみセクションの場合の元データ */
  collapsedData?: CollapsedSection | undefined;
}

/**
 * 時間変換コンテキスト
 */
export interface TimeConversionContext {
  /** すべてのグリッドセクション */
  sections: GridSection[];
  /** グリッド総高さ */
  totalHeight: number;
  /** 折りたたみが有効か */
  hasCollapsedSections: boolean;
}

/**
 * 睡眠時間帯の定義
 */
export interface SleepTimeRange {
  /** 開始時間（0-23） */
  startHour: number;
  /** 終了時間（0-24、日をまたぐ場合は startHour > endHour） */
  endHour: number;
}
