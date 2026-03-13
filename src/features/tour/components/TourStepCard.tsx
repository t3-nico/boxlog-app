'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

interface TourStepCardProps {
  titleKey: string;
  descriptionKey: string;
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

/** ツアーステップの共通コンテンツカード */
export function TourStepCard({
  titleKey,
  descriptionKey,
  currentStep,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}: TourStepCardProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-3" role="dialog" aria-label={t(titleKey)}>
      <div>
        <p className="text-muted-foreground text-xs">
          {t('tour.step', { current: currentStep, total: totalSteps })}
        </p>
        <h3 className="text-foreground font-bold">{t(titleKey)}</h3>
        <p className="text-muted-foreground text-sm">{t(descriptionKey)}</p>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          onClick={onSkip}
        >
          {t('tour.skip')}
        </button>
        <Button size="sm" onClick={onNext}>
          {isLastStep ? t('tour.done_button') : t('tour.next')}
        </Button>
      </div>
    </div>
  );
}
