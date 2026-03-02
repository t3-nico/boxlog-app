import { describe, expect, it } from 'vitest';

import type { PlanItem } from '../hooks/usePlanData';

import { groupItems } from './grouping';

// テスト用のモックアイテム
const createMockItem = (overrides: Partial<PlanItem> = {}): PlanItem => ({
  id: 'test-id',
  type: 'plan',
  title: 'テストプラン',
  status: 'open',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('grouping', () => {
  describe('groupItems', () => {
    describe('グループ化なし（null）', () => {
      it('nullの場合はすべてのアイテムを1グループにまとめる', () => {
        const items = [
          createMockItem({ id: '1', status: 'open' }),
          createMockItem({ id: '2', status: 'open' }),
          createMockItem({ id: '3', status: 'closed' }),
        ];

        const result = groupItems(items, null);

        expect(result).toHaveLength(1);
        expect(result[0]?.groupKey).toBe('all');
        expect(result[0]?.groupLabel).toBe('すべて');
        expect(result[0]?.count).toBe(3);
        expect(result[0]?.items).toHaveLength(3);
      });

      it('空配列の場合も正しく処理される', () => {
        const result = groupItems([], null);

        expect(result).toHaveLength(1);
        expect(result[0]?.count).toBe(0);
        expect(result[0]?.items).toHaveLength(0);
      });
    });

    describe('タグでグループ化', () => {
      it('タグIDでグループ分けされる', () => {
        const items = [
          createMockItem({
            id: '1',
            tagId: 'tag-1',
          }),
          createMockItem({
            id: '2',
            tagId: 'tag-2',
          }),
          createMockItem({
            id: '3',
            tagId: 'tag-1',
          }),
        ];

        const result = groupItems(items, 'tags');

        expect(result).toHaveLength(2);
        // tagIdベースのグループ化ではタグIDがgroupKeyになる
        expect(result.some((g) => g.groupKey === 'tag-1')).toBe(true);
        expect(result.some((g) => g.groupKey === 'tag-2')).toBe(true);
      });

      it('タグがない場合は「タグなし」グループに分類される', () => {
        const items = [
          createMockItem({ id: '1', tagId: undefined }),
          createMockItem({ id: '2', tagId: null }),
        ];

        const result = groupItems(items, 'tags');

        expect(result).toHaveLength(1);
        expect(result[0]?.groupKey).toBe('タグなし');
      });
    });

    describe('グループ結果の構造', () => {
      it('各グループにgroupKey, groupLabel, items, countが含まれる', () => {
        const items = [createMockItem({ id: '1', tagId: 'tag-1' })];

        const result = groupItems(items, 'tags');

        expect(result[0]).toHaveProperty('groupKey');
        expect(result[0]).toHaveProperty('groupLabel');
        expect(result[0]).toHaveProperty('items');
        expect(result[0]).toHaveProperty('count');
      });

      it('itemsの中身が元のアイテムと一致する', () => {
        const originalItem = createMockItem({
          id: 'unique-id',
          title: 'ユニークなタイトル',
          tagId: 'tag-1',
        });
        const items = [originalItem];

        const result = groupItems(items, 'tags');

        expect(result[0]?.items[0]).toEqual(originalItem);
      });
    });
  });
});
