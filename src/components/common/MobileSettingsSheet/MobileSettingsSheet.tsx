'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface MobileSettingsSheetProps {
  /** シートのタイトル */
  title: string;
  /** アクティブな設定があるかどうか（ドットインジケーター表示） */
  hasActiveSettings?: boolean;
  /** シートの内容 */
  children: React.ReactNode;
  /** リセットボタンのラベル（表示する場合） */
  resetLabel?: string;
  /** リセット時のコールバック */
  onReset?: () => void;
  /** トリガーボタンのカスタムアイコン */
  triggerIcon?: React.ReactNode;
  /** 外部から制御する場合のopen状態 */
  open?: boolean;
  /** 外部から制御する場合のonOpenChange */
  onOpenChange?: (open: boolean) => void;
  /** トリガーボタンを非表示にする（外部制御時） */
  hideTrigger?: boolean;
}

/**
 * モバイル用設定シート汎用コンポーネント
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * 各ページ（Inbox、Tags、Board等）で共通利用可能
 *
 * @example
 * ```tsx
 * <MobileSettingsSheet
 *   title="表示設定"
 *   hasActiveSettings={filterCount > 0}
 *   resetLabel="すべてリセット"
 *   onReset={handleReset}
 * >
 *   <MobileSettingsSection icon={<Filter />} title="フィルター">
 *     ...フィルター設定UI...
 *   </MobileSettingsSection>
 * </MobileSettingsSheet>
 * ```
 */
export function MobileSettingsSheet({
  title,
  hasActiveSettings = false,
  children,
  resetLabel,
  onReset,
  triggerIcon,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: MobileSettingsSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // 外部制御モードかどうか
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative shrink-0">
            {triggerIcon ?? <SlidersHorizontal className="size-4" />}
            {hasActiveSettings && (
              <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />
            )}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>{title}</DrawerTitle>
          <div className="flex items-center gap-1">
            {hasActiveSettings && resetLabel && onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                {resetLabel}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="閉じる">
                <X />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
