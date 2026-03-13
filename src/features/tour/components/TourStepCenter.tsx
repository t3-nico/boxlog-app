'use client';

import { TourStepCard } from './TourStepCard';

interface TourStepCenterProps {
  titleKey: string;
  descriptionKey: string;
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

/** 中央 Dialog 表示 — ターゲット要素なしの概念説明ステップ用 */
export function TourStepCenter({
  titleKey,
  descriptionKey,
  currentStep,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}: TourStepCenterProps) {
  return (
    <div className="z-tour fixed inset-0 flex items-center justify-center">
      <div className="bg-card animate-in fade-in zoom-in-95 w-80 rounded-xl p-6 shadow-lg duration-150">
        <TourStepCard
          titleKey={titleKey}
          descriptionKey={descriptionKey}
          currentStep={currentStep}
          totalSteps={totalSteps}
          isLastStep={isLastStep}
          onNext={onNext}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}
