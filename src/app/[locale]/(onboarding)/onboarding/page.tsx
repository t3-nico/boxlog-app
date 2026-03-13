/**
 * オンボーディングページ（Composition Layer）
 *
 * features/onboarding の OnboardingWizard に
 * features/chronotype のクイズ・定数を接続する。
 */
'use client';

import { useCallback, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  CHRONOTYPE_EMOJI,
  CHRONOTYPE_SELECTABLE_TYPES,
  ChronotypeQuiz,
} from '@/features/chronotype';
import { OnboardingWizard, useOnboardingStore } from '@/features/onboarding';
import { api } from '@/platform/trpc';

import type { PresetChronotypeType } from '@/types/chronotype';

export default function OnboardingPage() {
  const router = useRouter();

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
      // 1. Save onboarding data
      await completeMutation.mutateAsync({
        fullName: data.fullName,
        chronotypeType: data.chronotypeType ?? undefined,
      });

      // 2. Set onboarding cookie
      document.cookie = `dayopt_onboarded=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

      // 3. Navigate to calendar
      router.push('/calendar/day');
    },
    [completeMutation, router],
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
