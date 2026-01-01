#!/usr/bin/env node

/**
 * BoxLog MCP Server
 *
 * BoxLogのデータとClaude（および他のLLM）を連携させるMCPサーバー
 *
 * 環境変数:
 * - BOXLOG_API_URL: BoxLog tRPC API URL（例: http://localhost:3000/api/trpc）
 * - BOXLOG_ACCESS_TOKEN: OAuth 2.1 Access Token
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { getResource, getResourceTemplates } from './resources.js'
import { executeTool, getTools } from './tools.js'
import { createTRPCClient } from './trpc-client.js'
import type { MCPServerConfig } from './types.js'

/**
 * 環境変数から設定を取得
 */
function getConfig(): MCPServerConfig {
  const apiUrl = process.env.BOXLOG_API_URL
  const accessToken = process.env.BOXLOG_ACCESS_TOKEN

  if (!apiUrl) {
    throw new Error('BOXLOG_API_URL environment variable is required')
  }

  if (!accessToken) {
    throw new Error('BOXLOG_ACCESS_TOKEN environment variable is required')
  }

  return {
    apiUrl,
    accessToken,
  }
}

/**
 * MCPサーバーを起動
 */
async function main() {
  // 設定を取得
  const config = getConfig()

  // tRPCクライアントを作成
  const trpc = createTRPCClient(config)

  // MCPサーバーを作成
  const server = new Server(
    {
      name: 'boxlog',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  )

  // リソーステンプレート一覧を返す
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: getResourceTemplates(),
    }
  })

  // リソースを読み取る
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resource = await getResource(request.params.uri, trpc)
    return {
      contents: [resource],
    }
  })

  // ツール一覧を返す
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: getTools(),
    }
  })

  // ツールを実行
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await executeTool(
      request.params.name,
      request.params.arguments ?? {},
      trpc,
    )
    return result
  })

  // STDIOトランスポートで接続
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // エラーハンドリング
  server.onerror = (error) => {
    console.error('[MCP Error]', error)
  }

  process.on('SIGINT', async () => {
    await server.close()
    process.exit(0)
  })

  console.error('BoxLog MCP Server started')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
