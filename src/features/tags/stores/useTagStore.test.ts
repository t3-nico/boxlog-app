import { beforeEach, describe, expect, it } from 'vitest';

import { useTagStore } from './useTagStore';

describe('useTagStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useTagStore.setState({ tags: [] });
  });

  describe('addTag', () => {
    it('タグを追加できる', async () => {
      const result = await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags).toHaveLength(1);
      expect(tags[0]!.name).toBe('仕事');
      expect(tags[0]!.color).toBe('#3b82f6');
      expect(tags[0]!.is_active).toBe(true);
    });

    it('グループ付きのタグを追加できる', async () => {
      const result = await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        group_id: 'group-1',
      });

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags[0]!.group_id).toBe('group-1');
    });

    it('説明付きのタグを追加できる', async () => {
      const result = await useTagStore.getState().addTag({
        name: 'テストタグ',
        color: '#ef4444',
        description: 'テスト用のタグです',
      });

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags[0]!.description).toBe('テスト用のタグです');
    });
  });

  describe('updateTag', () => {
    it('タグを更新できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      const tagId = useTagStore.getState().tags[0]!.id;

      const result = await useTagStore.getState().updateTag(tagId, {
        name: '仕事（更新）',
        color: '#22c55e',
      });

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags[0]!.name).toBe('仕事（更新）');
      expect(tags[0]!.color).toBe('#22c55e');
    });

    it('グループを変更できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        group_id: 'group-1',
      });

      const tagId = useTagStore.getState().tags[0]!.id;

      const result = await useTagStore.getState().updateTag(tagId, {
        group_id: 'group-2',
      });

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags[0]!.group_id).toBe('group-2');
    });

    it('存在しないタグは更新できない', async () => {
      const result = await useTagStore.getState().updateTag('non-existent-id', {
        name: '更新',
      });

      expect(result).toBe(false);
    });
  });

  describe('deleteTag', () => {
    it('タグを削除できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      const tagId = useTagStore.getState().tags[0]!.id;

      const result = await useTagStore.getState().deleteTag(tagId);

      expect(result).toBe(true);
      const tags = useTagStore.getState().tags;
      expect(tags).toHaveLength(0);
    });

    it('存在しないタグは削除できない', async () => {
      const result = await useTagStore.getState().deleteTag('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getTagById', () => {
    it('IDでタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      const tagId = useTagStore.getState().tags[0]!.id;
      const tag = useTagStore.getState().getTagById(tagId);

      expect(tag).toBeDefined();
      expect(tag?.name).toBe('仕事');
    });

    it('存在しないIDはundefinedを返す', () => {
      const tag = useTagStore.getState().getTagById('non-existent-id');

      expect(tag).toBeUndefined();
    });
  });

  describe('getTagsByIds', () => {
    it('複数のIDでタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#22c55e',
      });

      const tagIds = useTagStore.getState().tags.map((t) => t.id);
      const tags = useTagStore.getState().getTagsByIds(tagIds);

      expect(tags).toHaveLength(2);
    });

    it('存在しないIDは無視される', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      const tagId = useTagStore.getState().tags[0]!.id;
      const tags = useTagStore.getState().getTagsByIds([tagId, 'non-existent']);

      expect(tags).toHaveLength(1);
    });
  });

  describe('getTagsByGroup', () => {
    it('グループに属するタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事1',
        color: '#3b82f6',
        group_id: 'group-1',
      });

      await useTagStore.getState().addTag({
        name: '仕事2',
        color: '#22c55e',
        group_id: 'group-1',
      });

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#ef4444',
        group_id: 'group-2',
      });

      const group1Tags = useTagStore.getState().getTagsByGroup('group-1');

      expect(group1Tags).toHaveLength(2);
      expect(group1Tags[0]!.name).toBe('仕事1');
      expect(group1Tags[1]!.name).toBe('仕事2');
    });

    it('グループなしのタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: 'タグ1',
        color: '#3b82f6',
      });

      await useTagStore.getState().addTag({
        name: 'タグ2',
        color: '#22c55e',
        group_id: 'group-1',
      });

      const ungroupedTags = useTagStore.getState().getTagsByGroup(null);

      expect(ungroupedTags).toHaveLength(1);
      expect(ungroupedTags[0]!.name).toBe('タグ1');
    });
  });

  describe('getActiveTags', () => {
    it('アクティブなタグのみ取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
      });

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#22c55e',
      });

      const tagId = useTagStore.getState().tags[0]!.id;
      await useTagStore.getState().updateTag(tagId, { is_active: false });

      const activeTags = useTagStore.getState().getActiveTags();

      expect(activeTags).toHaveLength(1);
      expect(activeTags[0]!.name).toBe('個人');
    });
  });
});
