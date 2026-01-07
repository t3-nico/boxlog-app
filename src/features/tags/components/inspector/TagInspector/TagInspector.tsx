'use client';

/**
 * Tag Inspector（タグ詳細Sheet）
 *
 * 共通Inspector基盤を使用
 * - useTagInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 */

import { FileText, Folder, FolderX, MoveUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { InspectorContent, InspectorHeader, InspectorShell } from '@/features/inspector';
import {
  DEFAULT_GROUP_COLOR,
  TAG_DESCRIPTION_MAX_LENGTH,
  TAG_NAME_MAX_LENGTH,
} from '@/features/tags/constants/colors';

import { TagArchiveDialog } from '../../TagArchiveDialog';
import { TagDeleteDialog } from '../../TagDeleteDialog';
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
  } = useTagInspectorLogic();

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

  return (
    <>
      <InspectorShell
        isOpen={isOpen}
        onClose={() => {
          if (showDeleteDialog || showArchiveDialog || showMergeDialog) return;
          closeInspector();
        }}
        displayMode={displayMode}
        title={tag?.name || 'タグの詳細'}
        resizable={true}
        modal={false}
      >
        <InspectorContent isLoading={isPending} hasData={!!tag} emptyMessage="タグが見つかりません">
          {tag && (
            <div className="flex h-full flex-col overflow-hidden">
              {/* ヘッダー */}
              <InspectorHeader
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onClose={closeInspector}
                onPrevious={goToPrevious}
                onNext={goToNext}
                previousLabel="前のタグ"
                nextLabel="次のタグ"
                displayMode={displayMode}
                menuContent={menuContent}
              />

              {/* タグ名とカラー */}
              <div className="flex min-h-10 items-start gap-2 px-4 py-2">
                <div className="relative mt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="size-4 rounded-full p-0"
                    style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
                    aria-label="カラー変更"
                  />
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
                        toast.info(`タグ名は${TAG_NAME_MAX_LENGTH}文字までです`, {
                          id: 'name-limit',
                        });
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="text-muted-foreground h-8 px-2 text-sm"
                  >
                    {tagGroup ? tagGroup.name : 'グループを選択...'}
                  </Button>
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
                        toast.info(`説明は${TAG_DESCRIPTION_MAX_LENGTH}文字までです`, {
                          id: 'description-limit',
                        });
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
                    const newStatus = currentStatus === 'done' ? 'open' : 'done';
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
                    紐づくレコード (0)
                  </h3>
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    このタグに紐づくレコードはありません
                  </div>
                </div>
              </div>
            </div>
          )}
        </InspectorContent>
      </InspectorShell>

      {/* 削除ダイアログ */}
      <TagDeleteDialog
        tag={showDeleteDialog ? tag : null}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!tagId) return;
          await deleteTagMutation.mutateAsync({ id: tagId });
          setShowDeleteDialog(false);
          closeInspector();
        }}
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
