/**
 * Chat API Route Handler
 *
 * Vercel AI SDKを使ったストリーミングチャットエンドポイント。
 * BYOK（Bring Your Own Key）モデル：APIキーはリクエストヘッダーで受け取る。
 *
 * tRPC例外理由:
 * - streamText().toUIMessageStreamResponse() は Response object を返す設計
 * - @ai-sdk/react の useChat と互換性のあるストリームプロトコルを使用
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { buildAIContext, buildSystemPrompt } from '@/server/services/ai';
import { DEFAULT_MODELS, SUPPORTED_MODELS } from '@/server/services/ai/types';

import type { AIProviderId } from '@/server/services/ai/types';
import type { UIMessage } from 'ai';

export const maxDuration = 60;

/**
 * プロバイダーIDのバリデーション
 */
function isValidProvider(providerId: string): providerId is AIProviderId {
  return providerId === 'anthropic' || providerId === 'openai';
}

/**
 * モデル名のバリデーション
 */
function isValidModel(providerId: AIProviderId, model: string): boolean {
  return SUPPORTED_MODELS[providerId].includes(model);
}

/**
 * AI プロバイダーからモデルインスタンスを作成
 */
function createModel(providerId: AIProviderId, apiKey: string, modelName?: string) {
  const model = modelName ?? DEFAULT_MODELS[providerId];

  switch (providerId) {
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
  }
}

export async function POST(req: Request) {
  try {
    // 1. 認証
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. リクエスト解析
    const body = (await req.json()) as {
      messages: UIMessage[];
      providerId?: string;
      model?: string;
    };
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 3. APIキー取得（ヘッダー）
    const apiKey = req.headers.get('x-ai-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please configure your API key in Settings > Integrations.' },
        { status: 400 },
      );
    }

    // 4. プロバイダー検証
    const providerId = body.providerId ?? 'anthropic';
    if (!isValidProvider(providerId)) {
      return NextResponse.json({ error: `Unsupported provider: ${providerId}` }, { status: 400 });
    }

    // 5. モデル検証
    if (body.model && !isValidModel(providerId, body.model)) {
      return NextResponse.json(
        {
          error: `Unsupported model: ${body.model}. Supported: ${SUPPORTED_MODELS[providerId].join(', ')}`,
        },
        { status: 400 },
      );
    }

    // 6. コンテキスト組み立て
    const aiContext = await buildAIContext(supabase, user.id);

    // 7. システムプロンプト生成
    const system = buildSystemPrompt(aiContext);

    // 8. ストリーミング生成
    const model = createModel(providerId, apiKey, body.model);
    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error('Chat API error:', error);

    // AI プロバイダーのエラーをフォワード
    if (error instanceof Error) {
      const status =
        error.message.includes('401') || error.message.includes('authentication') ? 401 : 500;
      return NextResponse.json(
        {
          error:
            status === 401 ? 'Invalid API key' : 'An error occurred while processing your request',
        },
        { status },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
