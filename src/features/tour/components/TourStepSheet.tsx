'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';

import { TourStepCard } from './TourStepCard';

interface TourStepSheetProps {
  titleKey: string;
  descriptionKey: string;
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

/** モバイル向け: 下部 Sheet でステップコンテンツを表示 */
export function TourStepSheet({
  titleKey,
  descriptionKey,
  currentStep,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}: TourStepSheetProps) {
  return (
    <Sheet open>
      <SheetContent
        side="bottom"
        className="z-tour rounded-t-xl"
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-4">
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
      </SheetContent>
    </Sheet>
  );
}
