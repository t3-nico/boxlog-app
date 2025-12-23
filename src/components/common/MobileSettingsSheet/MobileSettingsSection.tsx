'use client'

import { Separator } from '@/components/ui/separator'

interface MobileSettingsSectionProps {
  /** セクションアイコン */
  icon: React.ReactNode
  /** セクションタイトル */
  title: string
  /** セクションの内容 */
  children: React.ReactNode
  /** 区切り線を表示するか（デフォルト: true） */
  showSeparator?: boolean
}

/**
 * モバイル設定シート用セクションコンポーネント
 *
 * アイコン付きのセクションヘッダーと内容を表示
 *
 * @example
 * ```tsx
 * <MobileSettingsSection icon={<Filter />} title="フィルター">
 *   ...フィルター設定UI...
 * </MobileSettingsSection>
 * ```
 */
export function MobileSettingsSection({ icon, title, children, showSeparator = true }: MobileSettingsSectionProps) {
  return (
    <>
      <section className="py-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        {children}
      </section>
      {showSeparator && <Separator />}
    </>
  )
}
