/**
 * Record Activity Tracker Unit Tests
 *
 * Recordアクティビティトラッキングのテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// モジュール内のdetectRecordChanges関数を直接テストするため、
// 関数をエクスポートするか、トラッキング関数を通じてテストする

describe('Record Activity Tracker', () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>;
  };
  let mockInsert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };
  });

  describe('trackRecordChanges', () => {
    // 動的インポートでテスト
    it('should detect title changes', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { title: 'Old Title' };
      const newData = { title: 'New Title' };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockSupabase.from).toHaveBeenCalledWith('record_activities');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          record_id: 'record-123',
          user_id: 'user-123',
          action_type: 'title_changed',
          field_name: 'title',
          old_value: 'Old Title',
          new_value: 'New Title',
        }),
      );
    });

    it('should detect note changes', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { note: 'Old note' };
      const newData = { note: 'New note' };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'memo_changed',
          field_name: 'note',
          old_value: 'Old note',
          new_value: 'New note',
        }),
      );
    });

    it('should detect fulfillment score changes', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { fulfillment_score: 3 };
      const newData = { fulfillment_score: 5 };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'fulfillment_changed',
          field_name: 'fulfillment_score',
          old_value: '3',
          new_value: '5',
        }),
      );
    });

    it('should detect time changes (start_time)', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = {
        worked_at: '2024-01-15',
        start_time: '09:00:00',
        end_time: '10:00:00',
      };
      const newData = {
        worked_at: '2024-01-15',
        start_time: '10:00:00',
        end_time: '11:00:00',
      };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'time_changed',
          field_name: 'time',
        }),
      );
    });

    it('should detect worked_at date changes', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = {
        worked_at: '2024-01-15',
        start_time: '09:00:00',
        end_time: '10:00:00',
      };
      const newData = {
        worked_at: '2024-01-16',
        start_time: '09:00:00',
        end_time: '10:00:00',
      };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'time_changed',
          field_name: 'time',
        }),
      );
    });

    it('should record generic update when no specific changes detected', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { title: 'Same' };
      const newData = { title: 'Same' };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'updated',
          field_name: '',
        }),
      );
    });

    it('should track multiple changes at once', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = {
        title: 'Old Title',
        note: 'Old note',
        fulfillment_score: 3,
      };
      const newData = {
        title: 'New Title',
        note: 'New note',
        fulfillment_score: 5,
      };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      // Should be called 3 times for each change
      expect(mockInsert).toHaveBeenCalledTimes(3);
    });
  });

  describe('recordCreatedActivity', () => {
    it('should record created activity', async () => {
      const { recordCreatedActivity } = await import('../record-activity-tracker');

      await recordCreatedActivity(mockSupabase as never, 'record-123', 'user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('record_activities');
      expect(mockInsert).toHaveBeenCalledWith({
        record_id: 'record-123',
        user_id: 'user-123',
        action_type: 'created',
        field_name: null,
        old_value: null,
        new_value: null,
      });
    });
  });

  describe('recordTagAddedActivity', () => {
    it('should record tag added activity', async () => {
      const { recordTagAddedActivity } = await import('../record-activity-tracker');

      await recordTagAddedActivity(mockSupabase as never, 'record-123', 'user-123', 'Work');

      expect(mockInsert).toHaveBeenCalledWith({
        record_id: 'record-123',
        user_id: 'user-123',
        action_type: 'tag_added',
        field_name: 'tag',
        old_value: null,
        new_value: 'Work',
      });
    });
  });

  describe('recordTagRemovedActivity', () => {
    it('should record tag removed activity', async () => {
      const { recordTagRemovedActivity } = await import('../record-activity-tracker');

      await recordTagRemovedActivity(mockSupabase as never, 'record-123', 'user-123', 'Personal');

      expect(mockInsert).toHaveBeenCalledWith({
        record_id: 'record-123',
        user_id: 'user-123',
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: 'Personal',
        new_value: null,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null to value change for title', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { title: null };
      const newData = { title: 'New Title' };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'title_changed',
          old_value: '',
          new_value: 'New Title',
        }),
      );
    });

    it('should handle value to null change for note', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { note: 'Some note' };
      const newData = { note: null };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'memo_changed',
          old_value: 'Some note',
          new_value: '',
        }),
      );
    });

    it('should handle fulfillment_score null to value', async () => {
      const { trackRecordChanges } = await import('../record-activity-tracker');

      const oldData = { fulfillment_score: null };
      const newData = { fulfillment_score: 4 };

      await trackRecordChanges(mockSupabase as never, 'record-123', 'user-123', oldData, newData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'fulfillment_changed',
          old_value: '',
          new_value: '4',
        }),
      );
    });
  });
});
