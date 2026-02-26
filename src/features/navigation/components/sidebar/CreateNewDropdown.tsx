'use client';

import { useState } from 'react';

import { ChevronDown, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

import { useCreateMenuItems } from '@/hooks/useCreateMenuItems';

interface CreateNewDropdownProps {
  /** ボタンサイズ: 'default' = 40px, 'sm' = 32px */
  size?: 'default' | 'sm';
  /** ツールチップのテキスト */
  tooltipContent?: string;
  /** ツールチップの表示位置 */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 新規作成ドロップダウン
 *
 * Plan/Record/Tagsを選択して新規作成できるドロップダウンメニュー
 * - サイズはsize propsで制御（'default' = 40px, 'sm' = 32px）
 */
export function CreateNewDropdown({
  size = 'default',
  tooltipContent,
  tooltipSide = 'bottom',
}: CreateNewDropdownProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = useCreateMenuItems();

  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        icon
        className={size === 'sm' ? 'h-8 w-auto gap-0.5 px-1.5' : 'h-10 w-auto gap-1 px-2'}
        aria-label={t('sidebar.quickCreate')}
      >
        <SquarePen className={size === 'sm' ? 'size-4' : 'size-5'} />
        <ChevronDown className="text-muted-foreground size-3" />
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {tooltipContent ? (
        <HoverTooltip content={tooltipContent} side={tooltipSide} disabled={isOpen}>
          {trigger}
        </HoverTooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        {menuItems.map((entry, index) => {
          if (entry.type === 'separator') {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const IconComponent = entry.icon;

          return (
            <DropdownMenuItem key={entry.id} onClick={entry.action}>
              <IconComponent className="size-4" />
              {entry.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
