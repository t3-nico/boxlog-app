/**
 * オンボーディングページ用レイアウト
 *
 * 認証済みだがオンボーディング未完了のユーザー向け。
 * 軽量なOnboardingProviders（tRPC + Auth + Theme）のみ適用。
 *
 * @see src/shell/providers/OnboardingProviders.tsx
 */
import { OnboardingProviders } from '@/shell/providers/OnboardingProviders';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <OnboardingProviders>
      <main className="bg-background flex min-h-screen items-center justify-center">
        {children}
      </main>
    </OnboardingProviders>
  );
}
