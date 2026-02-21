import { describe, expect, it } from 'vitest';

import type { PlanActivity } from '../types/activity';

import { filterVisibleActivities, formatActivity, isVisibleActivity } from './activityFormatter';

function makeActivity(
  actionType: PlanActivity['action_type'],
  overrides?: Partial<PlanActivity>,
): PlanActivity {
  return {
    id: 'act-1',
    plan_id: 'plan-1',
    user_id: 'user-1',
    action_type: actionType,
    field_name: null,
    old_value: null,
    new_value: null,
    metadata: null,
    created_at: new Date().toISOString(),
    ...overrides,
  } as PlanActivity;
}

describe('activityFormatter (plans)', () => {
  describe('isVisibleActivity', () => {
    it('表示対象のアクションタイプはtrue', () => {
      expect(isVisibleActivity(makeActivity('created'))).toBe(true);
      expect(isVisibleActivity(makeActivity('status_changed'))).toBe(true);
      expect(isVisibleActivity(makeActivity('tag_added'))).toBe(true);
    });

    it('非表示のアクションタイプはfalse', () => {
      expect(isVisibleActivity(makeActivity('updated'))).toBe(false);
      expect(isVisibleActivity(makeActivity('description_changed'))).toBe(false);
      expect(isVisibleActivity(makeActivity('deleted'))).toBe(false);
    });
  });

  describe('filterVisibleActivities', () => {
    it('表示対象のみフィルタリングする', () => {
      const activities = [
        makeActivity('created'),
        makeActivity('updated'),
        makeActivity('status_changed'),
        makeActivity('deleted'),
      ];
      const filtered = filterVisibleActivities(activities);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((a) => a.action_type)).toEqual(['created', 'status_changed']);
    });
  });

  describe('formatActivity', () => {
    it('createdのフォーマット', () => {
      const result = formatActivity(makeActivity('created'));
      expect(result.actionLabelKey).toBe('plan.activity.created');
      expect(result.icon).toBe('create');
      expect(result.iconColor).toBe('success');
    });

    it('status_changed: closedはsuccessカラー', () => {
      const result = formatActivity(
        makeActivity('status_changed', { old_value: 'open', new_value: 'closed' }),
      );
      expect(result.iconColor).toBe('success');
      expect(result.detail).toBe('Open → Closed');
    });

    it('status_changed: openはwarningカラー', () => {
      const result = formatActivity(
        makeActivity('status_changed', { old_value: 'closed', new_value: 'open' }),
      );
      expect(result.iconColor).toBe('warning');
    });

    it('tag_added: new_valueをdetailに表示', () => {
      const result = formatActivity(makeActivity('tag_added', { new_value: '仕事' }));
      expect(result.detail).toBe('仕事');
      expect(result.icon).toBe('tag');
    });

    it('tag_removed: old_valueをdetailに表示', () => {
      const result = formatActivity(makeActivity('tag_removed', { old_value: '趣味' }));
      expect(result.detail).toBe('趣味');
    });

    it('title_changed: 変遷を表示', () => {
      const result = formatActivity(
        makeActivity('title_changed', { old_value: '旧タイトル', new_value: '新タイトル' }),
      );
      expect(result.detail).toBe('旧タイトル → 新タイトル');
    });
  });
});
