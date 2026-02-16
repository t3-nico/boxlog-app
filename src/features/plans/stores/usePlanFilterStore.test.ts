import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { usePlanFilterStore } from './usePlanFilterStore';

describe('usePlanFilterStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      usePlanFilterStore.getState().reset();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('statusは空配列', () => {
      const { status } = usePlanFilterStore.getState();
      expect(status).toEqual([]);
    });

    it('tagsは空配列', () => {
      const { tags } = usePlanFilterStore.getState();
      expect(tags).toEqual([]);
    });

    it('searchは空文字', () => {
      const { search } = usePlanFilterStore.getState();
      expect(search).toBe('');
    });

    it('assigneeは空文字', () => {
      const { assignee } = usePlanFilterStore.getState();
      expect(assignee).toBe('');
    });
  });

  describe('setStatus', () => {
    it('単一のステータスを設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setStatus(['open']);
      });

      const { status } = usePlanFilterStore.getState();
      expect(status).toEqual(['open']);
    });

    it('複数のステータスを設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setStatus(['open', 'closed']);
      });

      const { status } = usePlanFilterStore.getState();
      expect(status).toEqual(['open', 'closed']);
    });

    it('空配列で解除できる', () => {
      act(() => {
        usePlanFilterStore.getState().setStatus(['open']);
        usePlanFilterStore.getState().setStatus([]);
      });

      const { status } = usePlanFilterStore.getState();
      expect(status).toEqual([]);
    });
  });

  describe('setTags', () => {
    it('タグIDを設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setTags(['tag-1', 'tag-2']);
      });

      const { tags } = usePlanFilterStore.getState();
      expect(tags).toEqual(['tag-1', 'tag-2']);
    });

    it('空配列で解除できる', () => {
      act(() => {
        usePlanFilterStore.getState().setTags(['tag-1']);
        usePlanFilterStore.getState().setTags([]);
      });

      const { tags } = usePlanFilterStore.getState();
      expect(tags).toEqual([]);
    });
  });

  describe('setSearch', () => {
    it('検索文字列を設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setSearch('テスト検索');
      });

      const { search } = usePlanFilterStore.getState();
      expect(search).toBe('テスト検索');
    });

    it('空文字で解除できる', () => {
      act(() => {
        usePlanFilterStore.getState().setSearch('テスト');
        usePlanFilterStore.getState().setSearch('');
      });

      const { search } = usePlanFilterStore.getState();
      expect(search).toBe('');
    });
  });

  describe('setAssignee', () => {
    it('担当者を設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setAssignee('user-123');
      });

      const { assignee } = usePlanFilterStore.getState();
      expect(assignee).toBe('user-123');
    });
  });

  describe('reset', () => {
    it('全てのフィルターを初期状態に戻す', () => {
      // 各種フィルターを設定
      act(() => {
        usePlanFilterStore.getState().setStatus(['open', 'closed']);
        usePlanFilterStore.getState().setTags(['tag-1']);
        usePlanFilterStore.getState().setSearch('検索');
        usePlanFilterStore.getState().setAssignee('user-1');
      });

      // リセット
      act(() => {
        usePlanFilterStore.getState().reset();
      });

      const state = usePlanFilterStore.getState();
      expect(state.status).toEqual([]);
      expect(state.tags).toEqual([]);
      expect(state.search).toBe('');
      expect(state.assignee).toBe('');
    });
  });

  describe('複合フィルター', () => {
    it('複数のフィルターを同時に設定できる', () => {
      act(() => {
        usePlanFilterStore.getState().setStatus(['open']);
        usePlanFilterStore.getState().setTags(['tag-1']);
        usePlanFilterStore.getState().setSearch('重要');
      });

      const state = usePlanFilterStore.getState();
      expect(state.status).toEqual(['open']);
      expect(state.tags).toEqual(['tag-1']);
      expect(state.search).toBe('重要');
    });
  });
});
