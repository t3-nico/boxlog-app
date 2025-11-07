/**
 * タグ管理API エンドポイント
 * @description Supabase を使用したタグCRUD操作
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'
import type { CreateTagInput, Tag, TagWithChildren } from '@/types/tags'

/**
 * タグ一覧取得 (GET)
 * @description 認証ユーザーのタグを階層構造で取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching tags for user:', user.id)

    // クエリパラメータ
    const includeChildren = searchParams.get('include_children') === 'true'
    const sortField = searchParams.get('sort_field') || 'name'
    const sortOrder = searchParams.get('sort_order') || 'asc'

    // ベースクエリ: ユーザーのタグのみ取得
    let query = supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order(sortField, { ascending: sortOrder === 'asc' })

    const { data, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    console.log('Tags fetched:', data?.length || 0)

    // 階層構造の構築
    if (includeChildren) {
      const tagsMap = new Map<string, TagWithChildren>()
      const rootTags: TagWithChildren[] = []

      // 全タグをMapに登録
      data.forEach((tag: Tag) => {
        tagsMap.set(tag.id, { ...tag, children: [] })
      })

      // 親子関係を構築
      data.forEach((tag: Tag) => {
        const tagWithChildren = tagsMap.get(tag.id)!
        if (tag.parent_id) {
          const parent = tagsMap.get(tag.parent_id)
          if (parent) {
            parent.children.push(tagWithChildren)
          }
        } else {
          rootTags.push(tagWithChildren)
        }
      })

      return NextResponse.json({
        data: rootTags,
        count: data.length,
      })
    }

    return NextResponse.json({
      data,
      count: data.length,
    })
  } catch (error) {
    console.error('GET /api/tags error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タグ作成 (POST)
 * @description 新しいタグを作成
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTagInput = await request.json()
    const { name, color, description, icon, parent_id, level, group_id } = body

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Tag name must be 50 characters or less' }, { status: 400 })
    }

    // pathの計算
    let path = `#${name.trim()}`
    if (parent_id) {
      const { data: parentTag, error: parentError } = await supabase
        .from('tags')
        .select('path')
        .eq('id', parent_id)
        .single()

      if (parentError || !parentTag) {
        return NextResponse.json({ error: 'Parent tag not found' }, { status: 404 })
      }

      // @ts-expect-error - Supabase type inference issue with tags table
      path = `${parentTag.path}/${name.trim()}`
    }

    // タグデータ作成
    const tagData = {
      user_id: user.id,
      name: name.trim(),
      color: color || '#3B82F6',
      description: description?.trim() || null,
      icon: icon || null,
      parent_id: parent_id || null,
      level: level || 0,
      path,
      is_active: true,
      group_id: group_id || null,
    }

    const { data, error } = await supabase
      .from('tags')
      // @ts-expect-error - Supabase type inference issue with tags table
      .insert(tagData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タグ一括操作 (PATCH)
 * @description タグの移動・リネーム・色変更などの一括操作
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tag_id, action, data: updateData } = body

    if (!tag_id || !action) {
      return NextResponse.json({ error: 'tag_id and action are required' }, { status: 400 })
    }

    // タグの所有権チェック
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tag_id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // アクション別処理
    switch (action) {
      case 'move': {
        const { new_parent_id } = updateData
        const { data, error } = await supabase
          .from('tags')
          // @ts-expect-error - Supabase type inference issue with tags table
          .update({ parent_id: new_parent_id || null })
          .eq('id', tag_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'rename': {
        const { name } = updateData
        if (!name || name.trim().length === 0) {
          return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('tags')
          // @ts-expect-error - Supabase type inference issue with tags table
          .update({ name: name.trim() })
          .eq('id', tag_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'update_color': {
        const { color } = updateData
        if (!color) {
          return NextResponse.json({ error: 'Color is required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('tags')
          // @ts-expect-error - Supabase type inference issue with tags table
          .update({ color })
          .eq('id', tag_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
