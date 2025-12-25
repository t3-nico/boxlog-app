/**
 * Tag Groups API
 * GET: タググループ一覧取得
 * POST: 新しいタググループ作成
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { handleSupabaseError } from '@/lib/supabase/utils';
import type { CreateTagGroupInput } from '@/types/tags';

/**
 * タググループ一覧取得 (GET)
 * @description すべてのタググループを取得（タグ数を含む）
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[tag-groups GET] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // タググループ取得
    const { data, error } = await supabase
      .from('tag_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[tag-groups GET] Supabase error:', error);
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
    }

    console.debug('[tag-groups GET] Success - returning data:', JSON.stringify(data, null, 2));
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[tag-groups GET] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * タググループ作成 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[tag-groups POST] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CreateTagGroupInput;

    // バリデーション
    if (!body.name) {
      console.error('[tag-groups POST] Validation error: missing name');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // タググループ作成データ
    const insertData: {
      user_id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string | null;
      sort_order: number;
    } = {
      user_id: user.id,
      name: body.name,
      slug: body.slug || '', // 空文字列を許可
      description: body.description || null,
      color: body.color || null,
      sort_order: body.sort_order ?? 0,
    };

    // タググループ作成
    const { data, error } = await supabase.from('tag_groups').insert(insertData).select().single();

    if (error) {
      console.error('[tag-groups POST] Supabase error:', error);
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[tag-groups POST] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
