/**
 * MCP Resources
 *
 * 読み取り専用のデータリソース定義
 */

import { type Resource, type ResourceTemplate } from '@modelcontextprotocol/sdk/types.js'

import type { TRPCClient } from './trpc-client'

/**
 * リソーステンプレート一覧を取得
 */
export function getResourceTemplates(): ResourceTemplate[] {
  return [
    {
      uriTemplate: 'logs://boxlog/entries/{year}-{month}',
      name: 'Monthly Log Entries',
      description: 'Log entries for a specific month',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/entries/{id}',
      name: 'Individual Log Entry',
      description: 'Specific log entry with tags',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/tags',
      name: 'Tags',
      description: 'All tags',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/statistics/summary',
      name: 'Statistics Summary',
      description: 'Overall statistics (total tasks, completion rate, total time, etc.)',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/statistics/daily-hours',
      name: 'Daily Hours',
      description: 'Daily working hours',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/statistics/tag-breakdown',
      name: 'Tag Breakdown',
      description: 'Statistics by tag (usage count, last used, etc.)',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/notifications',
      name: 'Notifications',
      description: 'Unread notifications',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'logs://boxlog/activities/{plan-id}',
      name: 'Activity Log',
      description: 'Change history for a specific plan',
      mimeType: 'application/json',
    },
  ]
}

/**
 * リソースを取得
 *
 * @param uri - リソースURI
 * @param trpc - tRPCクライアント
 * @returns リソース内容
 */
export async function getResource(
  uri: string,
  trpc: TRPCClient,
): Promise<{ contents: Array<{ uri: string; mimeType?: string; text: string }> }> {
  const url = new URL(uri)

  // 月次ログエントリ
  if (url.pathname.startsWith('/entries/') && url.pathname.match(/\/entries\/\d{4}-\d{2}$/)) {
    // Note: BoxLog API doesn't have year/month filter yet, so we just return all entries
    const entries = await trpc.plans.list.query({})

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(entries, null, 2),
        },
      ],
    }
  }

  // 個別ログエントリ
  if (url.pathname.startsWith('/entries/') && url.pathname.match(/\/entries\/[a-f0-9-]+$/)) {
    const id = url.pathname.split('/').pop()!
    const entry = await trpc.plans.getById.query({ id, include: { tags: true } })

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(entry, null, 2),
        },
      ],
    }
  }

  // タグ一覧
  if (url.pathname === '/tags') {
    const tags = await trpc.tags.list.query()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(tags, null, 2),
        },
      ],
    }
  }

  // 統計情報（サマリー）
  if (url.pathname === '/statistics/summary') {
    const stats = await trpc.plans.getStats.query()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    }
  }

  // 統計情報（日次）
  if (url.pathname === '/statistics/daily-hours') {
    const dailyHours = await trpc.plans.getDailyHours.query({})

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(dailyHours, null, 2),
        },
      ],
    }
  }

  // 統計情報（タグ別）
  if (url.pathname === '/statistics/tag-breakdown') {
    const tagStats = await trpc.plans.getTagStats.query()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(tagStats, null, 2),
        },
      ],
    }
  }

  // 通知一覧
  if (url.pathname === '/notifications') {
    const notifications = await trpc.notifications.list.query()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(notifications, null, 2),
        },
      ],
    }
  }

  // アクティビティログ
  if (url.pathname.startsWith('/activities/')) {
    const planId = url.pathname.split('/').pop()!
    const activities = await trpc.plans.activities.query({ plan_id: planId })

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(activities, null, 2),
        },
      ],
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
}
