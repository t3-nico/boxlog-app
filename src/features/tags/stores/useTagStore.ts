import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { CreateTagInput, Tag, UpdateTagInput } from '@/features/tags/types';
import { logger } from '@/lib/logger';

interface TagStore {
  tags: Tag[];

  // Actions
  addTag: (tag: CreateTagInput) => Promise<boolean>;
  updateTag: (id: string, updates: UpdateTagInput) => Promise<boolean>;
  deleteTag: (id: string) => Promise<boolean>;
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
  getAllTags: () => Tag[];

  // Group helpers
  getTagsByGroup: (groupId: string | null) => Tag[];
  getActiveTags: () => Tag[];
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Comprehensive color palette for tags (50+ colors)
export const tagColors = [
  // Primary Colors
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500

  // Light Variants
  '#fca5a5', // red-300
  '#fdba74', // orange-300
  '#fde047', // yellow-300
  '#86efac', // green-300
  '#67e8f9', // cyan-300
  '#93c5fd', // blue-300
  '#c4b5fd', // violet-300
  '#f9a8d4', // pink-300

  // Dark Variants
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#ca8a04', // yellow-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600

  // Extended Palette
  '#991b1b', // red-800
  '#9a3412', // orange-800
  '#a16207', // yellow-800
  '#166534', // green-800
  '#155e75', // cyan-800
  '#1e40af', // blue-800
  '#5b21b6', // violet-800
  '#be185d', // pink-800

  // Additional Colors
  '#7f1d1d', // red-900
  '#7c2d12', // orange-900
  '#713f12', // yellow-900
  '#14532d', // green-900
  '#164e63', // cyan-900
  '#1e3a8a', // blue-900
  '#4c1d95', // violet-900
  '#831843', // pink-900

  // Grays and Neutrals
  '#374151', // gray-700
  '#4b5563', // gray-600
  '#6b7280', // gray-500
  '#9ca3af', // gray-400
  '#d1d5db', // gray-300

  // Special Colors
  '#0f172a', // slate-900
  '#1e293b', // slate-800
  '#334155', // slate-700
  '#475569', // slate-600
  '#64748b', // slate-500

  // Nature Colors
  '#365314', // lime-800
  '#4d7c0f', // lime-700
  '#65a30d', // lime-600
  '#84cc16', // lime-500
  '#a3e635', // lime-400

  // Tech Colors
  '#1f2937', // gray-800
  '#111827', // gray-900
  '#0c4a6e', // sky-800
  '#075985', // sky-700
  '#0369a1', // sky-600
];

// Color categories for better organization
export const colorCategories = {
  primary: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
  light: ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4'],
  dark: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'],
  neutral: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#0f172a', '#1e293b', '#334155'],
  nature: ['#365314', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635'],
  tech: ['#1f2937', '#111827', '#0c4a6e', '#075985', '#0369a1'],
};

// フラット構造の初期タグデータ
const initialTags: Tag[] = [];

export const useTagStore = create<TagStore>()(
  devtools(
    persist(
      (set, get) => ({
        tags: initialTags,

        addTag: async (tagData) => {
          try {
            const { tags } = get();

            // 後方互換性のため parentId, groupId, group_id をサポート
            const parentId = tagData.parentId ?? tagData.groupId ?? tagData.group_id ?? null;

            const newTag: Tag = {
              id: generateId(),
              name: tagData.name,
              user_id: 'current-user', // Auth integration tracked in Issue #87
              color: tagData.color,
              description: tagData.description || null,
              icon: tagData.icon || null,
              is_active: true,
              parent_id: parentId,
              sort_order: tags.length,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({ tags: [...tags, newTag] });
            return true;
          } catch (error) {
            logger.error('Failed to add tag:', error);
            return false;
          }
        },

        updateTag: async (id, updates) => {
          try {
            const { tags } = get();
            const tagExists = tags.some((tag) => tag.id === id);

            if (!tagExists) {
              throw new Error('Tag not found');
            }

            // 後方互換性のため parentId, groupId, group_id をサポート
            const newParentId = updates.parentId ?? updates.groupId ?? updates.group_id;

            set((state) => ({
              tags: state.tags.map((tag) => {
                if (tag.id === id) {
                  return {
                    ...tag,
                    ...(updates.name !== undefined && { name: updates.name }),
                    ...(updates.color !== undefined && { color: updates.color }),
                    ...(updates.description !== undefined && { description: updates.description }),
                    ...(updates.icon !== undefined && { icon: updates.icon }),
                    ...(updates.is_active !== undefined && { is_active: updates.is_active }),
                    ...(newParentId !== undefined && { parent_id: newParentId }),
                    ...(updates.sort_order !== undefined && { sort_order: updates.sort_order }),
                    updated_at: new Date().toISOString(),
                  } as Tag;
                }
                return tag;
              }),
            }));
            return true;
          } catch (error) {
            logger.error('Failed to update tag:', error);
            return false;
          }
        },

        deleteTag: async (id) => {
          try {
            const { tags } = get();
            const tagExists = tags.some((tag) => tag.id === id);

            if (!tagExists) {
              throw new Error('Tag not found');
            }

            set((state) => ({
              tags: state.tags.filter((tag) => tag.id !== id),
            }));
            return true;
          } catch (error) {
            logger.error('Failed to delete tag:', error);
            return false;
          }
        },

        getTagById: (id) => {
          const { tags } = get();
          return tags.find((tag) => tag.id === id);
        },

        getTagsByIds: (ids) => {
          const { tags } = get();
          return tags.filter((tag) => ids.includes(tag.id));
        },

        getAllTags: () => {
          const { tags } = get();
          return tags;
        },

        // Group helpers (parent_id based)
        getTagsByGroup: (groupId) => {
          const { tags } = get();
          return tags.filter((tag) => tag.parent_id === groupId && tag.is_active);
        },

        getActiveTags: () => {
          const { tags } = get();
          return tags.filter((tag) => tag.is_active);
        },
      }),
      {
        name: 'tag-storage',
        partialize: (state) => ({ tags: state.tags }),
      },
    ),
    {
      name: 'tag-store',
    },
  ),
);
