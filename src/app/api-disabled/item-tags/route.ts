import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// リクエストスキーマ
const createItemTagSchema = z.object({
  item_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  item_type: z.enum(['event', 'record', 'task'])
})

const deleteItemTagSchema = z.object({
  item_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  item_type: z.enum(['event', 'record', 'task'])
})

const batchCreateSchema = z.object({
  item_id: z.string().uuid(),
  tag_ids: z.array(z.string().uuid()),
  item_type: z.enum(['event', 'record', 'task'])
})

// アイテムにタグを追加
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // バッチ作成の場合
    if (body.tag_ids && Array.isArray(body.tag_ids)) {
      const { item_id, tag_ids, item_type } = batchCreateSchema.parse(body)
      
      // 既存のタグ関連を削除
      const { error: deleteError } = await supabase
        .from('item_tags')
        .delete()
        .eq('item_id', item_id)
        .eq('item_type', item_type)
        .eq('user_id', user.id)
      
      if (deleteError) {
        console.error('Delete existing tags error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to update item tags' },
          { status: 500 }
        )
      }
      
      // 新しいタグ関連を挿入
      if (tag_ids.length > 0) {
        const itemTags = tag_ids.map(tag_id => ({
          item_id,
          tag_id,
          item_type,
          user_id: user.id
        }))
        
        const { error: insertError } = await supabase
          .from('item_tags')
          .insert(itemTags)
        
        if (insertError) {
          console.error('Insert tags error:', insertError)
          return NextResponse.json(
            { error: 'Failed to create item tags' },
            { status: 500 }
          )
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Updated tags for ${item_type}`
      })
    }
    
    // 単一タグ追加の場合
    const { item_id, tag_id, item_type } = createItemTagSchema.parse(body)
    
    const { error } = await supabase
      .from('item_tags')
      .insert({
        item_id,
        tag_id,
        item_type,
        user_id: user.id
      })
    
    if (error) {
      console.error('Create item tag error:', error)
      return NextResponse.json(
        { error: 'Failed to create item tag' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item tag created successfully'
    })
    
  } catch (error) {
    console.error('POST /api/item-tags error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// アイテムからタグを削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { item_id, tag_id, item_type } = deleteItemTagSchema.parse(body)
    
    const { error } = await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', item_id)
      .eq('tag_id', tag_id)
      .eq('item_type', item_type)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Delete item tag error:', error)
      return NextResponse.json(
        { error: 'Failed to delete item tag' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item tag deleted successfully'
    })
    
  } catch (error) {
    console.error('DELETE /api/item-tags error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// アイテムのタグ取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('item_id')
    const itemType = searchParams.get('item_type')
    const tagIds = searchParams.get('tag_ids')?.split(',')
    
    let query = supabase
      .from('item_tags')
      .select(`
        *,
        tags:tag_id (
          id,
          name,
          color,
          path,
          level
        )
      `)
      .eq('user_id', user.id)
    
    // フィルタリング
    if (itemId) {
      query = query.eq('item_id', itemId)
    }
    
    if (itemType) {
      query = query.eq('item_type', itemType)
    }
    
    if (tagIds && tagIds.length > 0) {
      query = query.in('tag_id', tagIds)
    }
    
    const { data, error } = await query.order('tagged_at', { ascending: false })
    
    if (error) {
      console.error('Get item tags error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch item tags' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    })
    
  } catch (error) {
    console.error('GET /api/item-tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}