import { describe, expect, it } from 'vitest';

import { groupRecordItems } from './grouping';

interface TestRecord {
  id: string;
  worked_at: string;
  tagIds?: string[];
  fulfillment_score?: number | null;
}

const today = new Date().toISOString();

describe('records/grouping', () => {
  describe('groupRecordItems', () => {
    it('groupByがnullなら全件1グループ', () => {
      const items: TestRecord[] = [
        { id: '1', worked_at: today },
        { id: '2', worked_at: today },
      ];
      const groups = groupRecordItems(items, null);
      expect(groups).toHaveLength(1);
      expect(groups[0]!.groupKey).toBe('all');
      expect(groups[0]!.count).toBe(2);
    });

    it('fulfillment_scoreでグループ化', () => {
      const items: TestRecord[] = [
        { id: '1', worked_at: today, fulfillment_score: 5 },
        { id: '2', worked_at: today, fulfillment_score: 3 },
        { id: '3', worked_at: today, fulfillment_score: 5 },
        { id: '4', worked_at: today, fulfillment_score: null },
      ];
      const groups = groupRecordItems(items, 'fulfillment_score');

      // 高い順にソートされる
      expect(groups[0]!.groupKey).toBe('5');
      expect(groups[0]!.count).toBe(2);

      const scoreKeys = groups.map((g) => g.groupKey);
      expect(scoreKeys).toContain('3');
      expect(scoreKeys).toContain('none');
    });

    it('fulfillment_scoreのラベルが星で表示', () => {
      const items: TestRecord[] = [{ id: '1', worked_at: today, fulfillment_score: 3 }];
      const groups = groupRecordItems(items, 'fulfillment_score');
      expect(groups[0]!.groupLabel).toBe('★★★☆☆');
    });

    it('tagsでグループ化', () => {
      const items: TestRecord[] = [
        { id: '1', worked_at: today, tagIds: ['tag-a'] },
        { id: '2', worked_at: today, tagIds: ['tag-b'] },
        { id: '3', worked_at: today, tagIds: [] },
      ];
      const groups = groupRecordItems(items, 'tags');

      const keys = groups.map((g) => g.groupKey);
      expect(keys).toContain('tag-a');
      expect(keys).toContain('tag-b');
      expect(keys).toContain('タグなし');
    });

    it('タグなしグループは末尾に来る', () => {
      const items: TestRecord[] = [
        { id: '1', worked_at: today, tagIds: [] },
        { id: '2', worked_at: today, tagIds: ['tag-a'] },
      ];
      const groups = groupRecordItems(items, 'tags');
      expect(groups[groups.length - 1]!.groupKey).toBe('タグなし');
    });

    it('worked_atでグループ化（todayが先頭）', () => {
      const items: TestRecord[] = [{ id: '1', worked_at: today }];
      const groups = groupRecordItems(items, 'worked_at');
      expect(groups[0]!.groupKey).toBe('today');
    });

    it('空配列は空グループ', () => {
      const groups = groupRecordItems<TestRecord>([], 'fulfillment_score');
      expect(groups).toHaveLength(0);
    });
  });
});
