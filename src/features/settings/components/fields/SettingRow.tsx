'use client';

import { cn } from '@/lib/utils';

interface SettingRowProps {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
  isLast?: boolean;
}

/**
 * 設定画面の行コンポーネント
 * ChatGPT風のシンプルな1行表示（ラベル | 値 | アクション）
 */
export function SettingRow({ label, value, action, isLast = false }: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3',
        !isLast && 'border-border border-b',
      )}
    >
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="flex items-center gap-3">
        <div className="text-foreground text-sm">{value}</div>
        {action}
      </div>
    </div>
  );
}
