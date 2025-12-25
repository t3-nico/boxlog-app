'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * トグルバリアント定義
 *
 * ## サイズ設計（8pxグリッド準拠、ボタンと統一）
 *
 * | size    | 高さ  | 用途                                         |
 * |---------|-------|----------------------------------------------|
 * | sm      | 24px  | コンパクトUI、ツールバー                     |
 * | default | 32px  | 標準的なトグル                               |
 * | lg      | 40px  | 強調されたトグル                             |
 *
 * ## バリアント
 *
 * | variant | 用途                                         |
 * |---------|----------------------------------------------|
 * | ghost   | 透明背景、ホバーで背景出現                   |
 * | outline | ボーダー付き                                 |
 */
const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
    'hover:bg-state-hover',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'outline-none transition-[color,box-shadow]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ].join(' '),
  {
    variants: {
      variant: {
        ghost: 'bg-transparent',
        outline:
          'border border-border bg-background text-foreground shadow-xs hover:bg-state-hover',
      },
      size: {
        // sm: 24px高さ - ボタンと統一
        sm: ['h-6 px-2 min-w-6 text-xs', "[&_svg:not([class*='size-'])]:size-3.5"].join(' '),
        // default: 32px高さ - ボタンと統一
        default: ['h-8 px-3 min-w-8 text-sm', "[&_svg:not([class*='size-'])]:size-4"].join(' '),
        // lg: 40px高さ - ボタンと統一
        lg: ['h-10 px-4 min-w-10 text-base', "[&_svg:not([class*='size-'])]:size-5"].join(' '),
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
