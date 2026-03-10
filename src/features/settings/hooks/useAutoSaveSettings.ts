import { useCallback, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useDebouncedCallback } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface UseAutoSaveSettingsOptions<T> {
  initialValues: T;
  onSave: (values: T) => Promise<void>;
  debounceMs?: number;
  successMessage?: string;
  errorMessage?: string;
}

export function useAutoSaveSettings<T>({
  initialValues,
  onSave,
  debounceMs = 1000, // 1秒後に自動保存
  successMessage,
  errorMessage,
}: UseAutoSaveSettingsOptions<T>) {
  const t = useTranslations();
  const [values, setValues] = useState<T>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedValues = useRef<T>(initialValues);

  // デバウンスされた保存関数
  const debouncedSave = useDebouncedCallback(async (newValues: T) => {
    // 変更がない場合は保存しない
    if (JSON.stringify(newValues) === JSON.stringify(lastSavedValues.current)) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(newValues);
      lastSavedValues.current = newValues;

      // 成功トースト
      toast.success(successMessage ?? t('settings.common.saved'));
    } catch (error) {
      logger.error('Failed to save settings:', error);

      // エラートースト
      toast.error(errorMessage ?? t('settings.common.saveFailed'), {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }, debounceMs);

  // 値が変更されたら自動保存
  // useDebouncedCallbackは自動的にクリーンアップされる
  const prevValuesRef = useRef<T>(initialValues);
  if (JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
    prevValuesRef.current = values;
    debouncedSave(values);
  }

  const updateValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateValues = useCallback((updates: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    values,
    updateValue,
    updateValues,
    isSaving,
  };
}
