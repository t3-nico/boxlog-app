'use client';

/**
 * Tag Inspector（タグ詳細Sheet）
 *
 * 共通Inspector基盤を使用
 * - useTagInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 */

import { FileText, Folder, FolderX, Hash, MoveUpRight, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { InspectorContent, InspectorHeader, InspectorShell } from '@/features/inspector';
import {
  DEFAULT_GROUP_COLOR,
  TAG_DESCRIPTION_MAX_LENGTH,
  TAG_NAME_MAX_LENGTH,
} from '@/features/tags/constants/colors';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { TagArchiveDialog } from '../../TagArchiveDialog';
import { TagMergeDialog } from '../../TagMergeDialog';

import { TagInspectorMenu } from './TagInspectorMenu';
import { TagInspectorPlanList } from './TagInspectorPlanList';
import { useTagInspectorLogic } from './useTagInspectorLogic';

export function TagInspector() {
  const {
    isOpen,
    tagId,
    displayMode,
    setDisplayMode,
    openInspector,
    closeInspector,
    // 新規作成モード
    isCreateMode,
    // Data
    tag,
    groups,
    tagGroup,
    plans,
    isPending,
    isLoadingPlans,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    showColorPicker,
    setShowColorPicker,
    showDeleteDialog,
    setShowDeleteDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showMergeDialog,
    setShowMergeDialog,
    titleRef,
    descriptionRef,
    autoSave,
    handleColorChange,
    handleDelete,
    handleArchive,
    handleMerge,
    handleChangeGroup,
    updatePlan,
    openPlanInspector,
    updateTagMutation,
    deleteTagMutation,
    // 新規作成用
    newTagName,
    setNewTagName,
    newTagDescription,
    setNewTagDescription,
    newTagColor,
    setNewTagColor,
    newTagGroupId,
    setNewTagGroupId,
    handleCreateTag,
    isCreating,
  } = useTagInspectorLogic();

  const t = useTranslations();

  const menuContent = (
    <TagInspectorMenu
      groups={groups}
      currentGroupId={tagGroup?.id ?? null}
      displayMode={displayMode}
      onColorPickerOpen={() => setShowColorPicker(true)}
      onGroupChange={handleChangeGroup}
      onMerge={handleMerge}
      onArchive={handleArchive}
      onDelete={handleDelete}
      onDisplayModeChange={setDisplayMode}
    />
  );

  // 新規作成時のグループ
  const newTagGroup = newTagGroupId ? groups.find((g) => g.id === newTagGroupId) : null;

  return (
    <>
      <InspectorShell
        isOpen={isOpen}
        onClose={() => {
          if (showDeleteDialog || showArchiveDialog || showMergeDialog) return;
          closeInspector();
        }}
        displayMode={displayMode}
        title={isCreateMode ? t('tag.inspector.newTag') : tag?.name || t('tag.inspector.tagDetail')}
        resizable={true}
        modal={false}
      >
        {/* 新規作成モード */}
        {isCreateMode ? (
          <div className="flex h-full flex-col overflow-hidden">
            {/* ヘッダー */}
            <InspectorHeader
              hasPrevious={false}
              hasNext={false}
              onClose={closeInspector}
              displayMode={displayMode}
            />

            {/* タグ名とカラー */}
            <div className="flex min-h-10 items-start gap-2 px-4 py-2">
              <div className="relative mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="size-5 p-0"
                  aria-label={t('tag.inspector.changeColor')}
                >
                  <Hash className="size-5" style={{ color: newTagColor }} />
                </Button>
                {showColorPicker && (
                  <div className="bg-popover border-border absolute top-6 left-0 z-20 rounded-lg border p-3 shadow-lg">
                    <ColorPalettePicker
                      selectedColor={newTagColor}
                      onColorSelect={(color) => {
                        setNewTagColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t('tag.inspector.namePlaceholder')}
                maxLength={TAG_NAME_MAX_LENGTH}
                autoFocus
                className="flex-1 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagName.trim()) {
                    handleCreateTag();
                  }
                }}
              />
            </div>

            {/* グループ */}
            <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
              {newTagGroup ? (
                <Folder
                  className="mt-2 size-4 flex-shrink-0"
                  style={{ color: newTagGroup.color || DEFAULT_GROUP_COLOR }}
                />
              ) : (
                <FolderX className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
              )}
              <div className="flex min-h-8 flex-1 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 px-2 text-sm"
                    >
                      {newTagGroup?.name || t('tag.inspector.selectGroup')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setNewTagGroupId(null)}>
                      <FolderX className="text-muted-foreground mr-2 size-4" />
                      {t('tags.page.noGroup')}
                    </DropdownMenuItem>
                    {groups.map((group) => (
                      <DropdownMenuItem key={group.id} onClick={() => setNewTagGroupId(group.id)}>
                        <Folder
                          className="mr-2 size-4"
                          style={{ color: group.color || DEFAULT_GROUP_COLOR }}
                        />
                        {group.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* 説明 */}
            <div className="border-border/50 flex min-h-10 flex-1 items-start gap-2 border-t px-4 py-2">
              <FileText className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
              <Textarea
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                placeholder={t('tag.inspector.addDescription')}
                maxLength={TAG_DESCRIPTION_MAX_LENGTH}
                className="min-h-20 flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>

            {/* 保存ボタン */}
            <div className="border-border/50 flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="ghost" onClick={closeInspector} disabled={isCreating}>
                {t('tag.actions.cancel')}
              </Button>
              <Button onClick={handleCreateTag} disabled={!newTagName.trim() || isCreating}>
                <Save className="mr-2 size-4" />
                {isCreating ? t('tag.actions.creating') : t('tag.actions.create')}
              </Button>
            </div>
          </div>
        ) : (
          <InspectorContent
            isLoading={isPending}
            hasData={!!tag}
            emptyMessage={t('tags.search.noTags')}
          >
            {tag && (
              <div className="flex h-full flex-col overflow-hidden">
                {/* ヘッダー */}
                <InspectorHeader
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  onClose={closeInspector}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  previousLabel={t('tag.inspector.previousTag')}
                  nextLabel={t('tag.inspector.nextTag')}
                  displayMode={displayMode}
                  menuContent={menuContent}
                />

                {/* タグ名とカラー */}
                <div className="flex min-h-10 items-start gap-2 px-4 py-2">
                  <div className="relative mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="size-5 p-0"
                      aria-label={t('tag.inspector.changeColor')}
                    >
                      <Hash className="size-5" style={{ color: tag.color || DEFAULT_TAG_COLOR }} />
                    </Button>
                    {showColorPicker && (
                      <div className="bg-popover border-border absolute top-6 left-0 z-20 rounded-lg border p-3 shadow-lg">
                        <ColorPalettePicker
                          selectedColor={tag.color || DEFAULT_TAG_COLOR}
                          onColorSelect={handleColorChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-8 flex-1 items-center">
                    <span
                      ref={titleRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const text = e.currentTarget.textContent || '';
                        if (text.length > TAG_NAME_MAX_LENGTH) {
                          e.currentTarget.textContent = text.slice(0, TAG_NAME_MAX_LENGTH);
                          const range = document.createRange();
                          const selection = window.getSelection();
                          range.selectNodeContents(e.currentTarget);
                          range.collapse(false);
                          selection?.removeAllRanges();
                          selection?.addRange(range);
                          toast.info(
                            t('tag.validation.nameLimitReached', { max: TAG_NAME_MAX_LENGTH }),
                            {
                              id: 'name-limit',
                            },
                          );
                        }
                      }}
                      onBlur={(e) => autoSave('name', e.currentTarget.textContent || '')}
                      className="bg-popover border-0 px-0 text-lg font-semibold outline-none"
                    >
                      {tag.name}
                    </span>
                  </div>
                </div>

                {/* グループ */}
                <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
                  {tagGroup ? (
                    <Folder
                      className="mt-2 size-4 flex-shrink-0"
                      style={{ color: tagGroup.color || DEFAULT_GROUP_COLOR }}
                    />
                  ) : (
                    <FolderX className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
                  )}
                  <div className="flex min-h-8 flex-1 items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-8 px-2 text-sm"
                        >
                          {tagGroup?.name || t('tag.inspector.selectGroup')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleChangeGroup(null)}>
                          <FolderX className="text-muted-foreground mr-2 size-4" />
                          {t('tags.page.noGroup')}
                        </DropdownMenuItem>
                        {groups.map((group) => (
                          <DropdownMenuItem
                            key={group.id}
                            onClick={() => handleChangeGroup(group.id)}
                          >
                            <Folder
                              className="mr-2 size-4"
                              style={{ color: group.color || DEFAULT_GROUP_COLOR }}
                            />
                            {group.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 説明 */}
                <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
                  <FileText className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
                  <div className="min-h-8 min-w-0 flex-1">
                    <span
                      ref={descriptionRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const text = e.currentTarget.textContent || '';
                        if (text.length > TAG_DESCRIPTION_MAX_LENGTH) {
                          e.currentTarget.textContent = text.slice(0, TAG_DESCRIPTION_MAX_LENGTH);
                          const range = document.createRange();
                          const selection = window.getSelection();
                          range.selectNodeContents(e.currentTarget);
                          range.collapse(false);
                          selection?.removeAllRanges();
                          selection?.addRange(range);
                          toast.info(
                            t('tag.validation.descriptionLimitReached', {
                              max: TAG_DESCRIPTION_MAX_LENGTH,
                            }),
                            {
                              id: 'description-limit',
                            },
                          );
                        }
                      }}
                      onBlur={(e) => autoSave('description', e.currentTarget.textContent || '')}
                      className="text-muted-foreground empty:before:text-muted-foreground/60 block min-h-8 w-full pt-1.5 text-sm break-words outline-none empty:before:content-['説明を追加...']"
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {tag.description || ''}
                    </span>
                  </div>
                </div>

                {/* 紐づくプラン・レコード */}
                <div className="border-border/50 flex-1 space-y-4 overflow-y-auto border-t px-4 pt-4 pb-2">
                  <TagInspectorPlanList
                    plans={plans}
                    isLoading={isLoadingPlans}
                    onPlanClick={openPlanInspector}
                    onStatusToggle={(planId, currentStatus) => {
                      const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
                      updatePlan.mutate({
                        id: planId,
                        data: { status: newStatus },
                      });
                    }}
                  />

                  {/* 紐づくレコード */}
                  <div>
                    <h3 className="text-muted-foreground mb-2 flex items-center gap-1 text-sm font-medium">
                      <MoveUpRight className="size-4" />
                      {t('tag.inspector.linkedRecords', { count: 0 })}
                    </h3>
                    <div className="text-muted-foreground py-6 text-center text-sm">
                      {t('tag.inspector.noLinkedRecords')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </InspectorContent>
        )}
      </InspectorShell>

      {/* 削除ダイアログ */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!tagId) return;
          await deleteTagMutation.mutateAsync({ id: tagId });
          setShowDeleteDialog(false);
          closeInspector();
        }}
        title={t('tag.delete.confirmTitleWithName', { name: tag?.name ?? '' })}
        description={t('tag.delete.description')}
      />

      {/* アーカイブダイアログ */}
      <TagArchiveDialog
        tag={showArchiveDialog ? tag : null}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={async () => {
          if (!tagId) return;
          await updateTagMutation.mutateAsync({
            id: tagId,
            data: { is_active: false },
          });
          setShowArchiveDialog(false);
          closeInspector();
        }}
      />

      {/* マージダイアログ */}
      <TagMergeDialog
        tag={showMergeDialog ? tag : null}
        onClose={(mergedTargetTagId) => {
          setShowMergeDialog(false);
          if (mergedTargetTagId) {
            openInspector(mergedTargetTagId);
          } else {
            closeInspector();
          }
        }}
      />
    </>
  );
}
