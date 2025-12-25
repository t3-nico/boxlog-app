'use client';

import React from 'react';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';

interface SettingFieldProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
  required?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
}

/**
 * 設定画面用のフィールドコンポーネント
 * ChatGPT風の横並びレイアウト（左: ラベル/説明、右: コントロール）
 */
export const SettingField = ({
  label,
  description,
  children,
  required,
  orientation = 'horizontal',
}: SettingFieldProps) => {
  return (
    <Field orientation={orientation}>
      <FieldLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      {children && children}
    </Field>
  );
};
