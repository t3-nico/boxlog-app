'use client';

interface SettingRowProps {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * 設定画面の行コンポーネント
 * ChatGPT風のシンプルな1行表示（ラベル | 値 | アクション）
 */
export function SettingRow({ label, value, action }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="text-foreground text-base">{label}</div>
      <div className="flex items-center gap-4">
        <div className="text-foreground text-base">{value}</div>
        {action}
      </div>
    </div>
  );
}
