// Smart Folders CRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createSmartFolderSchema, 
  searchSmartFoldersSchema,
  type CreateSmartFolderInput,
  type SearchSmartFoldersInput
} from '@/lib/validations/smart-folders'
import { convertSmartFolderRowToSmartFolder } from '@/types/smart-folders'

// GET /api/smart-folders - スマートフォルダ一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // クエリパラメータの取得と検証
    const searchParams = request.nextUrl.searchParams
    const queryParams: SearchSmartFoldersInput = {
      query: searchParams.get('query') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isSystem: searchParams.get('isSystem') ? searchParams.get('isSystem') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: (searchParams.get('sortBy') as any) || 'order_index',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc'
    }

    const validatedParams = searchSmartFoldersSchema.parse(queryParams)

    // クエリ構築
    let query = supabase
      .from('smart_folders')
      .select('*')
      .eq('user_id', user.id)

    // フィルター適用
    if (validatedParams.query) {
      query = query.ilike('name', `%${validatedParams.query}%`)
    }
    if (validatedParams.isActive !== undefined) {
      query = query.eq('is_active', validatedParams.isActive)
    }
    if (validatedParams.isSystem !== undefined) {
      query = query.eq('is_system', validatedParams.isSystem)
    }

    // ソート適用
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' })

    // ページネーション適用
    if (validatedParams.limit) {
      query = query.range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1)
    }

    const { data: smartFolders, error } = await query

    if (error) {
      console.error('Smart folders fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch smart folders' }, { status: 500 })
    }

    // データ変換
    const convertedFolders = smartFolders?.map(convertSmartFolderRowToSmartFolder) || []

    return NextResponse.json({
      data: convertedFolders,
      pagination: {
        offset: validatedParams.offset,
        limit: validatedParams.limit,
        total: convertedFolders.length
      }
    })

  } catch (error) {
    console.error('Smart folders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/smart-folders - スマートフォルダ作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディの検証
    const body = await request.json()
    const validatedData: CreateSmartFolderInput = createSmartFolderSchema.parse(body)

    // 次の表示順序を取得
    const { data: lastFolder } = await supabase
      .from('smart_folders')
      .select('order_index')
      .eq('user_id', user.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = validatedData.orderIndex ?? ((lastFolder?.order_index ?? 0) + 1)

    // スマートフォルダを作成
    const { data: smartFolder, error } = await supabase
      .from('smart_folders')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        user_id: user.id,
        rules: validatedData.rules,
        icon: validatedData.icon || null,
        color: validatedData.color,
        order_index: nextOrderIndex,
        is_active: true,
        is_system: false
      })
      .select()
      .single()

    if (error) {
      console.error('Smart folder creation error:', error)
      return NextResponse.json({ error: 'Failed to create smart folder' }, { status: 500 })
    }

    // データ変換
    const convertedFolder = convertSmartFolderRowToSmartFolder(smartFolder)

    return NextResponse.json({ data: convertedFolder }, { status: 201 })

  } catch (error) {
    console.error('Smart folder creation API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}