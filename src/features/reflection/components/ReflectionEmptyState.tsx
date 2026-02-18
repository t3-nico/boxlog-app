'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/ui/empty-state';

interface ReflectionEmptyStateProps {
  /** 生成ボタンのコールバック */
  onGenerate: () => void;
  /** 生成ボタンを無効にするか */
  disabled?: boolean;
}

/**
 * Reflection未生成時の空状態
 *
 * Sparklesアイコン + 説明テキスト + 生成ボタンを表示
 */
export function ReflectionEmptyState({ onGenerate, disabled }: ReflectionEmptyStateProps) {
  const t = useTranslations('calendar.reflection');

  return (
    <EmptyState
      icon={Sparkles}
      title={t('empty.title')}
      description={t('empty.description')}
      actionLabel={t('empty.generate')}
      onAction={onGenerate}
      centered
      className={disabled ? 'pointer-events-none opacity-50' : undefined}
    />
  );
}
