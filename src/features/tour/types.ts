/** ツアーステップID */
export type TourStepId = 'grid-drag' | 'select-tag' | 'click-entry' | 'plan-vs-record';

/** ツアーステップの配置方向 */
export type TourStepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/** 自動進行の方式 */
export type TourAutoAdvance = 'dom-observe';

/** ツアーステップ定義 */
export interface TourStep {
  /** ステップ識別子 */
  id: TourStepId;
  /** data-tour-target 属性のセレクタ値（center 配置では不要） */
  targetSelector: string;
  /** Popover の配置方向（PC）。center の場合は中央 Dialog 表示 */
  placement: TourStepPlacement;
  /** i18n キー（title） */
  titleKey: string;
  /** i18n キー（description） */
  descriptionKey: string;
  /** DOM 監視による自動進行 */
  autoAdvance?: TourAutoAdvance;
  /** 自動進行時に監視する DOM セレクタ */
  observeSelector?: string;
}
