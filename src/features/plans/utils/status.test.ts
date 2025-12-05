import { describe, expect, it } from 'vitest'

import { canRevertToTodo, getEffectiveStatus, isOverdue } from './status'

describe('status', () => {
  describe('getEffectiveStatus', () => {
    describe('新ステータス値', () => {
      it('todoはtodoを返す', () => {
        expect(getEffectiveStatus({ status: 'todo' })).toBe('todo')
      })

      it('doingはdoingを返す', () => {
        expect(getEffectiveStatus({ status: 'doing' })).toBe('doing')
      })

      it('doneはdoneを返す', () => {
        expect(getEffectiveStatus({ status: 'done' })).toBe('done')
      })
    })

    describe('旧ステータス値のマッピング', () => {
      it('backlogはtodoにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'backlog' })).toBe('todo')
      })

      it('readyはtodoにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'ready' })).toBe('todo')
      })

      it('activeはdoingにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'active' })).toBe('doing')
      })

      it('waitはdoingにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'wait' })).toBe('doing')
      })

      it('cancelはdoneにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'cancel' })).toBe('done')
      })

      it('未知のステータスはtodoにマッピングされる', () => {
        expect(getEffectiveStatus({ status: 'unknown_status' })).toBe('todo')
      })
    })

    describe('start_timeによるステータス導出', () => {
      it('start_timeがあればdoingを返す（todoの場合）', () => {
        expect(
          getEffectiveStatus({
            status: 'todo',
            start_time: '2025-01-01T09:00:00Z',
          })
        ).toBe('doing')
      })

      it('start_timeがあってもdoneはdoneのまま', () => {
        expect(
          getEffectiveStatus({
            status: 'done',
            start_time: '2025-01-01T09:00:00Z',
          })
        ).toBe('done')
      })

      it('start_timeがnullならtodoはtodoのまま', () => {
        expect(
          getEffectiveStatus({
            status: 'todo',
            start_time: null,
          })
        ).toBe('todo')
      })

      it('start_timeがundefinedならtodoはtodoのまま', () => {
        expect(
          getEffectiveStatus({
            status: 'todo',
            start_time: undefined,
          })
        ).toBe('todo')
      })
    })
  })

  describe('canRevertToTodo', () => {
    it('start_timeがなければtrueを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'doing' as const,
        start_time: null,
        end_time: null,
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(canRevertToTodo(plan)).toBe(true)
    })

    it('start_timeがあればfalseを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'doing' as const,
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(canRevertToTodo(plan)).toBe(false)
    })
  })

  describe('isOverdue', () => {
    it('doneステータスはfalseを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'done' as const,
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(isOverdue(plan)).toBe(false)
    })

    it('end_timeがなければfalseを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'todo' as const,
        start_time: null,
        end_time: null,
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(isOverdue(plan)).toBe(false)
    })

    it('end_timeが過去で未完了ならtrueを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'todo' as const,
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(isOverdue(plan)).toBe(true)
    })

    it('end_timeが未来で未完了ならfalseを返す', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'todo' as const,
        start_time: null,
        end_time: '2099-01-01T10:00:00Z', // 未来
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(isOverdue(plan)).toBe(false)
    })

    it('旧ステータス（backlog）でも正しく判定する', () => {
      const plan = {
        id: 'plan-1',
        title: 'テスト',
        status: 'backlog' as unknown as 'todo',
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
        user_id: 'user-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      expect(isOverdue(plan)).toBe(true)
    })
  })
})
