import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TemplateStore {
  /** テンプレート一覧モーダルの開閉状態 */
  isListModalOpen: boolean;
  /** テンプレートフォームモーダルの開閉状態 */
  isFormModalOpen: boolean;
  /** 編集中のテンプレートID（nullの場合は新規作成） */
  editingTemplateId: string | null;

  // プランからテンプレート作成時のプリフィルデータ
  prefillData: {
    title: string;
    description: string | null;
    duration_minutes: number | null;
    reminder_minutes: number | null;
    tag_ids: string[];
  } | null;

  // Actions
  openListModal: () => void;
  closeListModal: () => void;
  openFormModal: (templateId?: string) => void;
  closeFormModal: () => void;
  /** プランからテンプレートとして保存 */
  openSaveAsTemplate: (data: {
    title: string;
    description: string | null;
    duration_minutes: number | null;
    reminder_minutes: number | null;
    tag_ids: string[];
  }) => void;
}

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    (set) => ({
      isListModalOpen: false,
      isFormModalOpen: false,
      editingTemplateId: null,
      prefillData: null,

      openListModal: () => set({ isListModalOpen: true }),
      closeListModal: () => set({ isListModalOpen: false }),

      openFormModal: (templateId?: string) =>
        set({
          isFormModalOpen: true,
          editingTemplateId: templateId ?? null,
          prefillData: null,
        }),
      closeFormModal: () =>
        set({
          isFormModalOpen: false,
          editingTemplateId: null,
          prefillData: null,
        }),

      openSaveAsTemplate: (data) =>
        set({
          isFormModalOpen: true,
          editingTemplateId: null,
          prefillData: data,
        }),
    }),
    { name: 'template-store' },
  ),
);
