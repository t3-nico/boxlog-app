'use client';

import type { ReactNode } from 'react';

interface SettingRowProps {
  label: ReactNode;
  description?: string;
  children: ReactNode;
}

/**
 * 設定画面の行コンポーネント（2カラム: ラベル | コントロール）
 * Apple Settings / ChatGPT 設定画面の標準パターン
 */
export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex min-w-[400px] items-center justify-between gap-4 py-2">
      <div className="min-w-[120px] flex-1">
        <div className="text-foreground text-base">{label}</div>
        {description && <div className="text-muted-foreground text-sm">{description}</div>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}
