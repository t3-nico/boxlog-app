import type { TourStep } from './types';

/** ツアーステップ定義（表示順） */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'grid-drag',
    targetSelector: '[data-tour-target="grid-drag"]',
    placement: 'bottom',
    titleKey: 'tour.steps.gridDrag.title',
    descriptionKey: 'tour.steps.gridDrag.description',
    autoAdvance: 'dom-observe',
    observeSelector: '[data-tag-palette]',
  },
  {
    id: 'select-tag',
    targetSelector: '[data-tour-target="grid-drag"]',
    placement: 'bottom',
    titleKey: 'tour.steps.selectTag.title',
    descriptionKey: 'tour.steps.selectTag.description',
    autoAdvance: 'dom-observe',
    observeSelector: '[data-plan-card]',
  },
  {
    id: 'click-entry',
    targetSelector: '[data-plan-card]',
    placement: 'right',
    titleKey: 'tour.steps.clickEntry.title',
    descriptionKey: 'tour.steps.clickEntry.description',
  },
  {
    id: 'plan-vs-record',
    targetSelector: '',
    placement: 'center',
    titleKey: 'tour.steps.planVsRecord.title',
    descriptionKey: 'tour.steps.planVsRecord.description',
  },
];

/** ツアーの総ステップ数（最大） */
export const TOUR_TOTAL_STEPS = TOUR_STEPS.length;

/** ツアー自動開始の遅延時間（ms） */
export const TOUR_START_DELAY = 500;
