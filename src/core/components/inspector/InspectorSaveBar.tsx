'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

interface InspectorSaveBarProps {
  onSave: () => void;
  visible: boolean;
}

export function InspectorSaveBar({ onSave, visible }: InspectorSaveBarProps) {
  const t = useTranslations();

  if (!visible) return null;

  return (
    <div className="sticky bottom-0 px-5 pt-2 pb-5">
      <Button className="w-full" onClick={onSave}>
        {t('common.actions.save')}
      </Button>
    </div>
  );
}
