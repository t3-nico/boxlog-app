'use client'

import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import type { TaskPriority, TaskStatus } from '@/types'

/**
 * 開発環境用：テストデータをLocalStorageに追加
 */
export function seedTestTasks() {
  const store = useTaskStore.getState()

  const statuses: TaskStatus[] = ['backlog', 'scheduled', 'in_progress', 'completed', 'stopped']
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  const testTasks = [
    {
      title: 'Next.js 14へのアップグレード',
      description: 'App Routerへの移行とパフォーマンス改善',
      status: 'in_progress' as TaskStatus,
      priority: 'high' as TaskPriority,
      planned_start: new Date('2025-10-14T09:00:00'),
      planned_duration: 240,
      tags: ['開発', 'フロントエンド'],
    },
    {
      title: 'APIエンドポイントのリファクタリング',
      description: 'tRPCを使用したタイプセーフなAPI実装',
      status: 'scheduled' as TaskStatus,
      priority: 'medium' as TaskPriority,
      planned_start: new Date('2025-10-14T13:00:00'),
      planned_duration: 180,
      tags: ['開発', 'バックエンド'],
    },
    {
      title: 'UIコンポーネントのテスト追加',
      description: 'shadcn/uiコンポーネントのユニットテスト',
      status: 'backlog' as TaskStatus,
      priority: 'low' as TaskPriority,
      planned_start: new Date('2025-10-15T10:00:00'),
      planned_duration: 120,
      tags: ['テスト', 'フロントエンド'],
    },
    {
      title: 'データベーススキーマ設計',
      description: 'Supabaseを使用したデータモデリング',
      status: 'completed' as TaskStatus,
      priority: 'urgent' as TaskPriority,
      planned_start: new Date('2025-10-13T14:00:00'),
      planned_duration: 300,
      tags: ['設計', 'バックエンド'],
    },
    {
      title: 'レスポンシブデザインの調整',
      description: 'モバイル・タブレット対応の改善',
      status: 'in_progress' as TaskStatus,
      priority: 'high' as TaskPriority,
      planned_start: new Date('2025-10-14T15:00:00'),
      planned_duration: 150,
      tags: ['デザイン', 'フロントエンド'],
    },
    {
      title: 'セキュリティ監査',
      description: 'OWASPガイドラインに基づく脆弱性チェック',
      status: 'stopped' as TaskStatus,
      priority: 'urgent' as TaskPriority,
      planned_start: new Date('2025-10-12T11:00:00'),
      planned_duration: 240,
      tags: ['セキュリティ'],
    },
  ]

  testTasks.forEach((task) => store.createTask(task))

  console.log('✅ テストデータを追加しました（6件のタスク）')
}

/**
 * 開発環境用：全データをクリア
 */
export function clearTestTasks() {
  const store = useTaskStore.getState()
  store.clearAllTasks()
  console.log('🗑️ 全てのタスクを削除しました')
}
