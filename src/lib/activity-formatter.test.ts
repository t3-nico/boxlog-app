import { describe, expect, it } from 'vitest';

import { createActivityFormatter, detailHelpers, formatTimeRange } from './activity-formatter';

describe('activity-formatter', () => {
  describe('formatTimeRange', () => {
    it('TIMESTAMPTZ範囲をHH:MM形式に変換', () => {
      const input = '2026-02-21T09:00:00+09:00 - 2026-02-21T10:00:00+09:00';
      const result = formatTimeRange(input);
      expect(result).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
    });

    it('不正な形式はそのまま返す', () => {
      expect(formatTimeRange('invalid')).toBe('invalid');
    });

    it('区切りがない場合はそのまま返す', () => {
      expect(formatTimeRange('2026-02-21T09:00:00')).toBe('2026-02-21T09:00:00');
    });
  });

  describe('detailHelpers', () => {
    it('transition: old→newの変遷を表示', () => {
      expect(detailHelpers.transition('old', 'new')).toBe('old → new');
    });

    it('transition: 片方がnullならundefined', () => {
      expect(detailHelpers.transition(null, 'new')).toBeUndefined();
      expect(detailHelpers.transition('old', null)).toBeUndefined();
    });

    it('newValue: new_valueを返す', () => {
      expect(detailHelpers.newValue(null, '新しい値')).toBe('新しい値');
    });

    it('newValue: nullならundefined', () => {
      expect(detailHelpers.newValue(null, null)).toBeUndefined();
    });

    it('oldValue: old_valueを返す', () => {
      expect(detailHelpers.oldValue('古い値', null)).toBe('古い値');
    });

    it('removed: new_valueがあればそれを返す', () => {
      expect(detailHelpers.removed(null, '削除対象')).toBe('削除対象');
    });

    it('removed: old_valueのみなら矢印付き', () => {
      expect(detailHelpers.removed('元の値', null)).toBe('元の値 → —');
    });

    it('removed: 両方nullならundefined', () => {
      expect(detailHelpers.removed(null, null)).toBeUndefined();
    });
  });

  describe('createActivityFormatter', () => {
    type TestAction = 'created' | 'updated' | 'deleted';
    const formatter = createActivityFormatter<TestAction>({
      visibleTypes: new Set<TestAction>(['created', 'updated']),
      config: {
        created: { labelKey: 'test.created', icon: 'create', iconColor: 'success' },
        updated: {
          labelKey: 'test.updated',
          icon: 'time',
          iconColor: 'info',
          formatDetail: detailHelpers.transition,
        },
      },
      defaultConfig: { labelKey: 'test.default', icon: 'time', iconColor: 'info' },
    });

    describe('isVisible', () => {
      it('visibleTypesに含まれるアクションはtrue', () => {
        expect(formatter.isVisible({ action_type: 'created' })).toBe(true);
        expect(formatter.isVisible({ action_type: 'updated' })).toBe(true);
      });

      it('含まれないアクションはfalse', () => {
        expect(formatter.isVisible({ action_type: 'deleted' })).toBe(false);
      });
    });

    describe('filterVisible', () => {
      it('表示対象のみフィルタリング', () => {
        const activities = [
          { action_type: 'created' as const },
          { action_type: 'deleted' as const },
          { action_type: 'updated' as const },
        ];
        const result = formatter.filterVisible(activities);
        expect(result).toHaveLength(2);
      });
    });

    describe('format', () => {
      it('configに基づいてフォーマット', () => {
        const result = formatter.format({ action_type: 'created' });
        expect(result.actionLabelKey).toBe('test.created');
        expect(result.icon).toBe('create');
        expect(result.iconColor).toBe('success');
        expect(result.detail).toBeUndefined();
      });

      it('formatDetailがあればdetailを生成', () => {
        const result = formatter.format({
          action_type: 'updated',
          old_value: 'A',
          new_value: 'B',
        });
        expect(result.detail).toBe('A → B');
      });

      it('configに存在しないアクションはdefaultConfigを使用', () => {
        const result = formatter.format({ action_type: 'deleted' });
        expect(result.actionLabelKey).toBe('test.default');
      });
    });
  });
});
