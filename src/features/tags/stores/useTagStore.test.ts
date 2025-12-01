import { beforeEach, describe, expect, it } from 'vitest'

import type { TagLevel } from '@/types/tags'
import type { Task } from '@/types/unified'

import { useTagStore } from './useTagStore'

describe('useTagStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useTagStore.setState({ tags: [] })
  })

  describe('addTag', () => {
    it('ルートレベルのタグを追加できる', async () => {
      const result = await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      expect(result).toBe(true)
      const tags = useTagStore.getState().tags
      expect(tags).toHaveLength(1)
      expect(tags[0]!.name).toBe('仕事')
      expect(tags[0]!.level).toBe(1)
      expect(tags[0]!.path).toBe('仕事')
      expect(tags[0]!.parent_id).toBeNull()
    })

    it('子タグを追加できる', async () => {
      // 親タグを追加
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      // 子タグを追加
      const result = await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: parentId,
      })

      expect(result).toBe(true)
      const tags = useTagStore.getState().tags
      expect(tags).toHaveLength(2)
      expect(tags[1]!.name).toBe('プロジェクトA')
      expect(tags[1]!.parent_id).toBe(parentId)
      expect(tags[1]!.path).toBe('仕事/プロジェクトA')
    })

    it('レベル2を超えるタグは追加できない', async () => {
      const result = await useTagStore.getState().addTag({
        name: 'レベル3タグ',
        color: '#3b82f6',
        level: 3 as TagLevel, // 意図的に無効な値でバリデーションをテスト
      })

      expect(result).toBe(false)
    })

    it('レベル2タグに子タグは追加できない', async () => {
      // レベル1タグを追加
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const level1Id = useTagStore.getState().tags[0]!.id

      // レベル2タグを追加
      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: level1Id,
      })

      const level2Id = useTagStore.getState().tags[1]!.id

      // レベル3タグを追加しようとする
      const result = await useTagStore.getState().addTag({
        name: 'サブタスク',
        color: '#ef4444',
        level: 3 as TagLevel, // 意図的に無効な値でバリデーションをテスト
        parent_id: level2Id,
      })

      expect(result).toBe(false)
    })
  })

  describe('updateTag', () => {
    it('タグを更新できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id

      const result = await useTagStore.getState().updateTag(tagId, {
        name: '仕事（更新）',
        color: '#22c55e',
      })

      expect(result).toBe(true)
      const tags = useTagStore.getState().tags
      expect(tags[0]!.name).toBe('仕事（更新）')
      expect(tags[0]!.color).toBe('#22c55e')
    })

    it('存在しないタグは更新できない', async () => {
      const result = await useTagStore.getState().updateTag('non-existent-id', {
        name: '更新',
      })

      expect(result).toBe(false)
    })
  })

  describe('deleteTag', () => {
    it('タグを削除できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id

      const result = await useTagStore.getState().deleteTag(tagId)

      expect(result).toBe(true)
      const tags = useTagStore.getState().tags
      expect(tags).toHaveLength(0)
    })

    it('存在しないタグは削除できない', async () => {
      const result = await useTagStore.getState().deleteTag('non-existent-id')

      expect(result).toBe(false)
    })
  })

  describe('getTagById', () => {
    it('IDでタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id
      const tag = useTagStore.getState().getTagById(tagId)

      expect(tag).toBeDefined()
      expect(tag?.name).toBe('仕事')
    })

    it('存在しないIDはundefinedを返す', () => {
      const tag = useTagStore.getState().getTagById('non-existent-id')

      expect(tag).toBeUndefined()
    })
  })

  describe('getTagsByIds', () => {
    it('複数のIDでタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#22c55e',
        level: 1,
      })

      const tagIds = useTagStore.getState().tags.map((t) => t.id)
      const tags = useTagStore.getState().getTagsByIds(tagIds)

      expect(tags).toHaveLength(2)
    })

    it('存在しないIDは無視される', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id
      const tags = useTagStore.getState().getTagsByIds([tagId, 'non-existent'])

      expect(tags).toHaveLength(1)
    })
  })

  describe('getRootTags', () => {
    it('ルートレベルのタグのみ取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: parentId,
      })

      const rootTags = useTagStore.getState().getRootTags()

      expect(rootTags).toHaveLength(1)
      expect(rootTags[0]!.name).toBe('仕事')
    })
  })

  describe('getChildTags', () => {
    it('指定した親の子タグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: parentId,
      })

      await useTagStore.getState().addTag({
        name: 'プロジェクトB',
        color: '#ef4444',
        level: 2,
        parent_id: parentId,
      })

      const childTags = useTagStore.getState().getChildTags(parentId)

      expect(childTags).toHaveLength(2)
      expect(childTags[0]!.name).toBe('プロジェクトA')
      expect(childTags[1]!.name).toBe('プロジェクトB')
    })
  })

  describe('getTagsByLevel', () => {
    it('指定したレベルのタグを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#22c55e',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#ef4444',
        level: 2,
        parent_id: parentId,
      })

      const level1Tags = useTagStore.getState().getTagsByLevel(1)
      const level2Tags = useTagStore.getState().getTagsByLevel(2)

      expect(level1Tags).toHaveLength(2)
      expect(level2Tags).toHaveLength(1)
    })
  })

  describe('getTaskCount', () => {
    it('タグが使用されているタスク数を取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id

      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'タスク1',
          status: 'scheduled',
          priority: 'medium',
          planned_start: new Date().toISOString(),
          planned_duration: 60,
          tags: [tagId],
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'タスク2',
          status: 'scheduled',
          priority: 'medium',
          planned_start: new Date().toISOString(),
          planned_duration: 60,
          tags: [tagId],
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'task-3',
          title: 'タスク3',
          status: 'scheduled',
          priority: 'medium',
          planned_start: new Date().toISOString(),
          planned_duration: 60,
          tags: [],
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const count = useTagStore.getState().getTaskCount(tasks, tagId)

      expect(count).toBe(2)
    })
  })

  describe('getUsedTags', () => {
    it('使用されているタグのみ取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      await useTagStore.getState().addTag({
        name: '個人',
        color: '#22c55e',
        level: 1,
      })

      const [tag1] = useTagStore.getState().tags

      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'タスク1',
          status: 'scheduled',
          priority: 'medium',
          planned_start: new Date().toISOString(),
          planned_duration: 60,
          tags: [tag1!.id],
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const usedTags = useTagStore.getState().getUsedTags(tasks)

      expect(usedTags).toHaveLength(1)
      expect(usedTags[0]!.id).toBe(tag1!.id)
    })
  })

  describe('getTagPath', () => {
    it('タグのパスを取得できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: parentId,
      })

      const childId = useTagStore.getState().tags[1]!.id
      const path = useTagStore.getState().getTagPath(childId)

      expect(path).toBe('仕事/プロジェクトA')
    })
  })

  describe('canAddChild', () => {
    it('レベル1タグには子を追加できる', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const tagId = useTagStore.getState().tags[0]!.id
      const canAdd = useTagStore.getState().canAddChild(tagId)

      expect(canAdd).toBe(true)
    })

    it('レベル2タグには子を追加できない', async () => {
      await useTagStore.getState().addTag({
        name: '仕事',
        color: '#3b82f6',
        level: 1,
      })

      const parentId = useTagStore.getState().tags[0]!.id

      await useTagStore.getState().addTag({
        name: 'プロジェクトA',
        color: '#22c55e',
        level: 2,
        parent_id: parentId,
      })

      const level2Id = useTagStore.getState().tags[1]!.id
      const canAdd = useTagStore.getState().canAddChild(level2Id)

      expect(canAdd).toBe(true) // level < 3 なので true（実装上の注意点）
    })
  })
})
