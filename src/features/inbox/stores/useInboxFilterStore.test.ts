import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useInboxFilterStore } from './useInboxFilterStore';

describe('useInboxFilterStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useInboxFilterStore.getState().reset();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('statusは空配列', () => {
      const { status } = useInboxFilterStore.getState();
      expect(status).toEqual([]);
    });

    it('tagsは空配列', () => {
      const { tags } = useInboxFilterStore.getState();
      expect(tags).toEqual([]);
    });

    it('searchは空文字', () => {
      const { search } = useInboxFilterStore.getState();
      expect(search).toBe('');
    });

    it('assigneeは空文字', () => {
      const { assignee } = useInboxFilterStore.getState();
      expect(assignee).toBe('');
    });

    it('dueDateはall', () => {
      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('all');
    });
  });

  describe('setStatus', () => {
    it('単一のステータスを設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setStatus(['open']);
      });

      const { status } = useInboxFilterStore.getState();
      expect(status).toEqual(['open']);
    });

    it('複数のステータスを設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setStatus(['open', 'closed']);
      });

      const { status } = useInboxFilterStore.getState();
      expect(status).toEqual(['open', 'closed']);
    });

    it('空配列で解除できる', () => {
      act(() => {
        useInboxFilterStore.getState().setStatus(['open']);
        useInboxFilterStore.getState().setStatus([]);
      });

      const { status } = useInboxFilterStore.getState();
      expect(status).toEqual([]);
    });
  });

  describe('setTags', () => {
    it('タグIDを設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setTags(['tag-1', 'tag-2']);
      });

      const { tags } = useInboxFilterStore.getState();
      expect(tags).toEqual(['tag-1', 'tag-2']);
    });

    it('空配列で解除できる', () => {
      act(() => {
        useInboxFilterStore.getState().setTags(['tag-1']);
        useInboxFilterStore.getState().setTags([]);
      });

      const { tags } = useInboxFilterStore.getState();
      expect(tags).toEqual([]);
    });
  });

  describe('setSearch', () => {
    it('検索文字列を設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setSearch('テスト検索');
      });

      const { search } = useInboxFilterStore.getState();
      expect(search).toBe('テスト検索');
    });

    it('空文字で解除できる', () => {
      act(() => {
        useInboxFilterStore.getState().setSearch('テスト');
        useInboxFilterStore.getState().setSearch('');
      });

      const { search } = useInboxFilterStore.getState();
      expect(search).toBe('');
    });
  });

  describe('setAssignee', () => {
    it('担当者を設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setAssignee('user-123');
      });

      const { assignee } = useInboxFilterStore.getState();
      expect(assignee).toBe('user-123');
    });
  });

  describe('setDueDate', () => {
    it('今日に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('today');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('today');
    });

    it('明日に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('tomorrow');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('tomorrow');
    });

    it('今週に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('this_week');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('this_week');
    });

    it('来週に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('next_week');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('next_week');
    });

    it('期限超過に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('overdue');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('overdue');
    });

    it('期限なしに設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('no_due_date');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('no_due_date');
    });

    it('全てに戻せる', () => {
      act(() => {
        useInboxFilterStore.getState().setDueDate('today');
        useInboxFilterStore.getState().setDueDate('all');
      });

      const { dueDate } = useInboxFilterStore.getState();
      expect(dueDate).toBe('all');
    });
  });

  describe('reset', () => {
    it('全てのフィルターを初期状態に戻す', () => {
      // 各種フィルターを設定
      act(() => {
        useInboxFilterStore.getState().setStatus(['open', 'closed']);
        useInboxFilterStore.getState().setTags(['tag-1']);
        useInboxFilterStore.getState().setSearch('検索');
        useInboxFilterStore.getState().setAssignee('user-1');
        useInboxFilterStore.getState().setDueDate('today');
      });

      // リセット
      act(() => {
        useInboxFilterStore.getState().reset();
      });

      const state = useInboxFilterStore.getState();
      expect(state.status).toEqual([]);
      expect(state.tags).toEqual([]);
      expect(state.search).toBe('');
      expect(state.assignee).toBe('');
      expect(state.dueDate).toBe('all');
    });
  });

  describe('複合フィルター', () => {
    it('複数のフィルターを同時に設定できる', () => {
      act(() => {
        useInboxFilterStore.getState().setStatus(['open']);
        useInboxFilterStore.getState().setTags(['tag-1']);
        useInboxFilterStore.getState().setDueDate('this_week');
        useInboxFilterStore.getState().setSearch('重要');
      });

      const state = useInboxFilterStore.getState();
      expect(state.status).toEqual(['open']);
      expect(state.tags).toEqual(['tag-1']);
      expect(state.dueDate).toBe('this_week');
      expect(state.search).toBe('重要');
    });
  });
});
