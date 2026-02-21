'use client';

/**
 * テンプレート作成/編集フォームモーダル
 *
 * テンプレートの作成・編集を行うフォーム
 * Inspectorの「テンプレートとして保存」またはテンプレート一覧の「新規作成」で開かれる
 */

import { memo, useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useCreateTemplate, useTemplate, useUpdateTemplate } from '../hooks';
import { useTemplateStore } from '../stores/useTemplateStore';

export const TemplateFormModal = memo(function TemplateFormModal() {
  const t = useTranslations('templates');
  const tc = useTranslations('common');
  const isOpen = useTemplateStore((s) => s.isFormModalOpen);
  const editingTemplateId = useTemplateStore((s) => s.editingTemplateId);
  const prefillData = useTemplateStore((s) => s.prefillData);
  const closeFormModal = useTemplateStore((s) => s.closeFormModal);

  const isEditing = !!editingTemplateId;
  const { data: existingTemplate } = useTemplate(editingTemplateId ?? '');

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [titlePattern, setTitlePattern] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [reminderMinutes, setReminderMinutes] = useState<string>('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  // Initialize form when editing or prefilling
  useEffect(() => {
    if (isEditing && existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description ?? '');
      setTitlePattern(existingTemplate.title_pattern);
      setPlanDescription(existingTemplate.plan_description ?? '');
      setDurationMinutes(existingTemplate.duration_minutes?.toString() ?? '');
      setReminderMinutes(existingTemplate.reminder_minutes?.toString() ?? '');
      setTagIds(existingTemplate.tag_ids);
    } else if (prefillData) {
      setName('');
      setDescription('');
      setTitlePattern(prefillData.title);
      setPlanDescription(prefillData.description ?? '');
      setDurationMinutes(prefillData.duration_minutes?.toString() ?? '');
      setReminderMinutes(prefillData.reminder_minutes?.toString() ?? '');
      setTagIds(prefillData.tag_ids);
    } else if (!isEditing) {
      // 新規作成: フォームをリセット
      setName('');
      setDescription('');
      setTitlePattern('');
      setPlanDescription('');
      setDurationMinutes('');
      setReminderMinutes('');
      setTagIds([]);
    }
  }, [isEditing, existingTemplate, prefillData]);

  const handleSubmit = useCallback(() => {
    const parsedDuration = durationMinutes ? parseInt(durationMinutes, 10) : null;
    const parsedReminder = reminderMinutes ? parseInt(reminderMinutes, 10) : null;

    if (isEditing && editingTemplateId) {
      updateTemplate.mutate(
        {
          id: editingTemplateId,
          name: name.trim(),
          description: description.trim() || null,
          title_pattern: titlePattern.trim(),
          plan_description: planDescription.trim() || null,
          duration_minutes: parsedDuration,
          reminder_minutes: parsedReminder,
          tag_ids: tagIds,
        },
        { onSuccess: () => closeFormModal() },
      );
    } else {
      createTemplate.mutate(
        {
          name: name.trim(),
          description: description.trim() || null,
          title_pattern: titlePattern.trim(),
          plan_description: planDescription.trim() || null,
          duration_minutes: parsedDuration,
          reminder_minutes: parsedReminder,
          tag_ids: tagIds,
        },
        { onSuccess: () => closeFormModal() },
      );
    }
  }, [
    isEditing,
    editingTemplateId,
    name,
    description,
    titlePattern,
    planDescription,
    durationMinutes,
    reminderMinutes,
    tagIds,
    createTemplate,
    updateTemplate,
    closeFormModal,
  ]);

  const isSubmitDisabled =
    !name.trim() || !titlePattern.trim() || createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeFormModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('formModal.editTitle') : t('formModal.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('formModal.editDescription') : t('formModal.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* テンプレート名 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-name">{t('fields.name')}</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('fields.namePlaceholder')}
              maxLength={100}
            />
          </div>

          {/* テンプレートの説明 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-description">{t('fields.description')}</Label>
            <Input
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('fields.descriptionPlaceholder')}
            />
          </div>

          {/* プランタイトルパターン */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-title-pattern">{t('fields.titlePattern')}</Label>
            <Input
              id="template-title-pattern"
              value={titlePattern}
              onChange={(e) => setTitlePattern(e.target.value)}
              placeholder={t('fields.titlePatternPlaceholder')}
              maxLength={200}
            />
          </div>

          {/* プランの説明 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-plan-description">{t('fields.planDescription')}</Label>
            <Textarea
              id="template-plan-description"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder={t('fields.planDescriptionPlaceholder')}
              rows={2}
            />
          </div>

          {/* 所要時間 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-duration">{t('fields.duration')}</Label>
            <Input
              id="template-duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder={t('fields.durationPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeFormModal}>
            {tc('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {isEditing ? tc('actions.save') : tc('actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
