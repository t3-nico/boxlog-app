/**
 * オンボーディングページ（Composition Layer）
 *
 * features/onboarding の OnboardingWizard に
 * features/chronotype のクイズ・定数を接続する。
 */
'use client';

import { useCallback, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import {
  CHRONOTYPE_EMOJI,
  CHRONOTYPE_SELECTABLE_TYPES,
  ChronotypeQuiz,
} from '@/features/chronotype';
import { OnboardingWizard, useOnboardingStore } from '@/features/onboarding';
import { logger } from '@/lib/logger';
import { useRouter } from '@/platform/i18n/navigation';
import { api } from '@/platform/trpc';
import { toast } from 'sonner';

import type { PresetChronotypeType } from '@/types/chronotype';

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations();

  // Fetch profile for pre-filling name
  const { data: profile } = api.onboarding.getProfile.useQuery();

  // Complete mutation
  const completeMutation = api.onboarding.complete.useMutation();

  // Chronotype card data
  const cardData = useMemo(
    () =>
      CHRONOTYPE_SELECTABLE_TYPES.map((type) => ({
        type,
        emoji: CHRONOTYPE_EMOJI[type],
      })),
    [],
  );

  // Quiz complete handler
  const store = useOnboardingStore();
  const handleQuizComplete = useCallback(
    (type: PresetChronotypeType) => {
      store.setChronotypeType(type);
    },
    [store],
  );

  // Wizard complete handler
  const handleComplete = useCallback(
    async (data: { fullName: string; chronotypeType: PresetChronotypeType | null }) => {
      try {
        // 1. Save onboarding data
        await completeMutation.mutateAsync({
          fullName: data.fullName,
          chronotypeType: data.chronotypeType ?? undefined,
        });

        // 2. Navigate to calendar (middleware will set httpOnly cookie on next request)
        router.push('/calendar/day');
      } catch (error) {
        logger.error('Onboarding complete failed:', error);
        toast.error(t('onboarding.error.completeFailed'));
      }
    },
    [completeMutation, router, t],
  );

  // Quiz component (rendered here in Composition Layer, passed as prop)
  const quizComponent = useMemo(
    () => (
      <ChronotypeQuiz onComplete={handleQuizComplete} onCancel={() => store.setShowQuiz(false)} />
    ),
    [handleQuizComplete, store],
  );

  return (
    <OnboardingWizard
      initialName={profile?.full_name ?? ''}
      cardData={cardData}
      quizComponent={quizComponent}
      onComplete={handleComplete}
      isCompleting={completeMutation.isPending}
    />
  );
}
