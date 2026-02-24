import { describe, expect, it } from 'vitest';

import type { RecordActivity } from '../types/activity';

import { filterVisibleActivities, formatActivity, isVisibleActivity } from './activityFormatter';

function makeActivity(
  actionType: RecordActivity['action_type'],
  overrides?: Partial<RecordActivity>,
): RecordActivity {
  return {
    id: 'act-1',
    record_id: 'rec-1',
    user_id: 'user-1',
    action_type: actionType,
    field_name: null,
    old_value: null,
    new_value: null,
    metadata: null,
    created_at: new Date().toISOString(),
    ...overrides,
  } as RecordActivity;
}

describe('activityFormatter (records)', () => {
  describe('isVisibleActivity', () => {
    it('表示対象のアクションタイプはtrue', () => {
      expect(isVisibleActivity(makeActivity('created'))).toBe(true);
      expect(isVisibleActivity(makeActivity('fulfillment_changed'))).toBe(true);
      expect(isVisibleActivity(makeActivity('tag_added'))).toBe(true);
    });

    it('非表示のアクションタイプはfalse', () => {
      expect(isVisibleActivity(makeActivity('updated'))).toBe(false);
      expect(isVisibleActivity(makeActivity('deleted'))).toBe(false);
    });
  });

  describe('filterVisibleActivities', () => {
    it('表示対象のみフィルタリングする', () => {
      const activities = [
        makeActivity('created'),
        makeActivity('updated'),
        makeActivity('tag_removed'),
        makeActivity('deleted'),
      ];
      const filtered = filterVisibleActivities(activities);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((a) => a.action_type)).toEqual(['created', 'tag_removed']);
    });
  });

  describe('formatActivity', () => {
    it('createdのフォーマット', () => {
      const result = formatActivity(makeActivity('created'));
      expect(result.actionLabelKey).toBe('record.activity.created');
      expect(result.icon).toBe('create');
      expect(result.iconColor).toBe('success');
    });

    it('fulfillment_changed: 変遷を表示', () => {
      const result = formatActivity(
        makeActivity('fulfillment_changed', { old_value: '3', new_value: '5' }),
      );
      expect(result.detail).toBe('3 → 5');
      expect(result.iconColor).toBe('warning');
    });

    it('tag_added: new_valueをdetailに表示', () => {
      const result = formatActivity(makeActivity('tag_added', { new_value: '運動' }));
      expect(result.detail).toBe('運動');
      expect(result.icon).toBe('tag');
      expect(result.iconColor).toBe('primary');
    });

    it('tag_removed: old_valueをdetailに表示', () => {
      const result = formatActivity(makeActivity('tag_removed', { old_value: '読書' }));
      expect(result.detail).toBe('読書');
      expect(result.iconColor).toBe('destructive');
    });

    it('description_changed: detailなし', () => {
      const result = formatActivity(makeActivity('description_changed'));
      expect(result.detail).toBeUndefined();
    });
  });
});
