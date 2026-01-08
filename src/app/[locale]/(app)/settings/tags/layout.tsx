'use client';

/**
 * Settings/Tags用レイアウト
 *
 * Settingsのデフォルトlayoutをオーバーライドして、
 * Tagsページはフルスクリーン表示にする。
 * (Settingsのスタック遷移UIではなく、テーブルUIを使用)
 */
export default function SettingsTagsLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full">{children}</div>;
}
