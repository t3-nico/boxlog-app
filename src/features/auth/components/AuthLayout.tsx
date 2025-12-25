'use client';

import type React from 'react';

import { usePathname } from 'next/navigation';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // ログインとサインアップページは shadcn/ui の2カラムレイアウトを使用するため、ラップしない
  if (
    pathname?.includes('/auth/login') ||
    pathname?.includes('/auth/signup') ||
    pathname?.includes('/auth/password') ||
    pathname?.includes('/auth/mfa-verify')
  ) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-2">
      <div className="bg-card lg:ring-border w-full max-w-sm p-6 lg:rounded-xl lg:p-10 lg:shadow-xs lg:ring-1">
        {children}
      </div>
    </main>
  );
};
