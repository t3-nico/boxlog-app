/**
 * MCP Tools
 *
 * 書き込み・実行アクション定義
 */

import { type Tool } from '@modelcontextprotocol/sdk/types.js'

import type { TRPCClient } from './trpc-client'

/**
 * ツール一覧を取得
 */
export function getTools(): Tool[] {
  return [
    {
      name: 'create_entry',
      description: 'Create a new task/log entry with optional tags',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Task title (required, 1-200 characters)',
          },
          description: {
            type: 'string',
            description: 'Task description (optional, markdown supported)',
          },
          scheduledDate: {
            type: 'string',
            format: 'date',
            description: 'Scheduled date (YYYY-MM-DD)',
          },
          tagIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tag IDs to associate with this task',
          },
        },
        required: ['title'],
      },
    },
    {
      name: 'update_entry',
      description: 'Update an existing task',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Task ID' },
          title: { type: 'string' },
          description: { type: 'string' },
          scheduledDate: { type: 'string', format: 'date' },
          tagIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['id'],
      },
    },
    {
      name: 'delete_entry',
      description: 'Delete a task',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Task ID' },
        },
        required: ['id'],
      },
    },
    {
      name: 'search_entries',
      description: 'Search tasks by keyword, tags, or date range',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword' },
          tagIds: { type: 'array', items: { type: 'string' } },
          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
        },
      },
    },
    {
      name: 'create_tag',
      description: 'Create a new tag',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        },
        required: ['name', 'color'],
      },
    },
    {
      name: 'merge_tags',
      description: 'Merge source tags into a target tag',
      inputSchema: {
        type: 'object',
        properties: {
          sourceTagId: { type: 'string' },
          targetTagId: { type: 'string' },
        },
        required: ['sourceTagId', 'targetTagId'],
      },
    },
    {
      name: 'mark_notification_read',
      description: 'Mark a notification as read',
      inputSchema: {
        type: 'object',
        properties: {
          notificationId: { type: 'string', description: 'Notification ID' },
        },
        required: ['notificationId'],
      },
    },
  ]
}

/**
 * ツールを実行
 *
 * @param name - ツール名
 * @param args - 引数
 * @param trpc - tRPCクライアント
 * @returns 実行結果
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  trpc: TRPCClient,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    switch (name) {
      case 'create_entry': {
        const result = await trpc.plans.createWithTags.mutate({
          title: args.title as string,
          description: args.description as string | undefined,
          scheduledDate: args.scheduledDate as string | undefined,
          tagIds: args.tagIds as string[] | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'update_entry': {
        const result = await trpc.plans.updateWithTags.mutate({
          id: args.id as string,
          title: args.title as string | undefined,
          description: args.description as string | undefined,
          scheduledDate: args.scheduledDate as string | undefined,
          tagIds: args.tagIds as string[] | undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'delete_entry': {
        const result = await trpc.plans.deleteWithCleanup.mutate({
          id: args.id as string,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'search_entries': {
        const result = await trpc.plans.list.query({
          search: args.query as string | undefined,
          // Note: BoxLog API doesn't support tagIds array or dateFrom/dateTo filters yet
          // We can only use tagId (singular) for now
          tagId: args.tagIds ? (args.tagIds as string[])[0] : undefined,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'create_tag': {
        const result = await trpc.tags.create.mutate({
          name: args.name as string,
          color: args.color as string,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'merge_tags': {
        const result = await trpc.tags.merge.mutate({
          sourceTagId: args.sourceTagId as string,
          targetTagId: args.targetTagId as string,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'mark_notification_read': {
        const result = await trpc.notifications.markAsRead.mutate({
          id: args.notificationId as string,
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    }
  }
}
