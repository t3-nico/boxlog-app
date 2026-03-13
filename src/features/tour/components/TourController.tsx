'use client';

import { useCallback, useEffect } from 'react';

import { usePathname } from '@/platform/i18n/navigation';

import { TOUR_START_DELAY, TOUR_STEPS } from '../constants';
import { useTourStore } from '../stores/useTourStore';
import { TourBackdrop } from './TourBackdrop';
import { TourDoneCard } from './TourDoneCard';
import { TourStep } from './TourStep';

/**
 * ツアーオーケストレータ
 *
 * GlobalOverlays にマウントし、カレンダーページでのみツアーを表示。
 * 初回訪問時に自動開始、完了/スキップ後は再表示しない。
 * Step 1 はドラッグ作成後に MutationObserver で自動進行。
 */
export function TourController() {
  const pathname = usePathname();

  const isActive = useTourStore.use.isActive();
  const completed = useTourStore.use.completed();
  const currentStepIndex = useTourStore.use.currentStepIndex();
  const startTour = useTourStore.use.startTour();
  const skipTour = useTourStore.use.skipTour();
  const completeTour = useTourStore.use.completeTour();

  const isCalendarPage = pathname.startsWith('/calendar');

  // カレンダーページのみで自動開始
  useEffect(() => {
    if (!isCalendarPage || completed) return;

    const timer = setTimeout(() => {
      startTour();
    }, TOUR_START_DELAY);

    return () => clearTimeout(timer);
  }, [isCalendarPage, completed, startTour]);

  // 最終ステップの「次へ」→ done カードへ（isActive 維持、index を範囲外に）
  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    useTourStore.setState({ currentStepIndex: nextIndex });
  }, [currentStepIndex]);

  // MutationObserver: autoAdvance ステップで新規追加ノードのみ監視して自動進行
  const currentStep = TOUR_STEPS[currentStepIndex];
  useEffect(() => {
    if (!isActive || !currentStep?.autoAdvance || !currentStep.observeSelector) return;

    // ★ 既存カードは無視（リプレイ時のスキップ防止）
    // addedNodes のみチェックし、DOM に既にある要素では進行しない
    const target = document.querySelector(currentStep.targetSelector);
    if (!target) return;

    const selector = currentStep.observeSelector;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(selector) || node.querySelector(selector)) {
            observer.disconnect();
            handleNext();
            return;
          }
        }
      }
    });

    observer.observe(target, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isActive, currentStep, handleNext]);

  // ツアーが非アクティブなら何も表示しない
  if (!isActive) return null;

  // カレンダー以外では非表示（ステートは維持、戻れば復帰）
  if (!isCalendarPage) return null;

  // 全ステップ完了（done カード表示）
  if (!currentStep) {
    return (
      <>
        <TourBackdrop />
        <TourDoneCard onDone={completeTour} />
      </>
    );
  }

  const displayStep = currentStepIndex + 1;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <>
      <TourBackdrop />
      <TourStep
        key={currentStep.id}
        targetSelector={currentStep.targetSelector}
        placement={currentStep.placement}
        titleKey={currentStep.titleKey}
        descriptionKey={currentStep.descriptionKey}
        currentStep={displayStep}
        totalSteps={TOUR_STEPS.length}
        isLastStep={isLastStep}
        onNext={handleNext}
        onSkip={skipTour}
      />
    </>
  );
}
