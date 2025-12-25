'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * アバターサイズ定義
 *
 * ## サイズ設計（8pxグリッド準拠）
 *
 * | size    | サイズ | 用途                                         |
 * |---------|--------|----------------------------------------------|
 * | xs      | 24px   | インライン、コンパクトリスト                 |
 * | sm      | 32px   | コメント、通知                               |
 * | default | 40px   | 標準的なUI                                   |
 * | lg      | 48px   | プロフィールカード                           |
 * | xl      | 64px   | プロフィールページ、ヒーロー                 |
 */
const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      xs: 'size-6',
      sm: 'size-8',
      default: 'size-10',
      lg: 'size-12',
      xl: 'size-16',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-surface-container flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage, avatarVariants };
