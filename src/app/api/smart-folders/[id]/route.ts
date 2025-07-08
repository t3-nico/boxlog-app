// Smart Folders 個別CRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  updateSmartFolderSchema,
  type UpdateSmartFolderInput
} from '@/lib/validations/smart-folders'
import { convertSmartFolderRowToSmartFolder } from '@/types/smart-folders'

// GET /api/smart-folders/[id] - 個別スマートフォルダ取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: smartFolder, error } = await supabase
      .from('smart_folders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Smart folder not found' }, { status: 404 })
      }
      console.error('Smart folder fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch smart folder' }, { status: 500 })
    }

    // データ変換
    const convertedFolder = convertSmartFolderRowToSmartFolder(smartFolder)

    return NextResponse.json({ data: convertedFolder })

  } catch (error) {
    console.error('Smart folder fetch API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/smart-folders/[id] - スマートフォルダ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディの検証
    const body = await request.json()
    const validatedData: UpdateSmartFolderInput = updateSmartFolderSchema.parse(body)

    // 既存のスマートフォルダをチェック
    const { data: existingFolder, error: fetchError } = await supabase
      .from('smart_folders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Smart folder not found' }, { status: 404 })
      }
      console.error('Smart folder fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch smart folder' }, { status: 500 })
    }

    // システムフォルダの制限チェック
    if (existingFolder.is_system && (validatedData.name || validatedData.rules)) {
      return NextResponse.json({ 
        error: 'System folders cannot be renamed or have their rules modified' 
      }, { status: 403 })
    }

    // 更新データの準備
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.rules !== undefined) updateData.rules = validatedData.rules
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
    if (validatedData.color !== undefined) updateData.color = validatedData.color
    if (validatedData.orderIndex !== undefined) updateData.order_index = validatedData.orderIndex

    // スマートフォルダを更新
    const { data: smartFolder, error } = await supabase
      .from('smart_folders')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Smart folder update error:', error)
      return NextResponse.json({ error: 'Failed to update smart folder' }, { status: 500 })
    }

    // データ変換
    const convertedFolder = convertSmartFolderRowToSmartFolder(smartFolder)

    return NextResponse.json({ data: convertedFolder })

  } catch (error) {
    console.error('Smart folder update API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/smart-folders/[id] - スマートフォルダ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 既存のスマートフォルダをチェック
    const { data: existingFolder, error: fetchError } = await supabase
      .from('smart_folders')
      .select('is_system')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Smart folder not found' }, { status: 404 })
      }
      console.error('Smart folder fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch smart folder' }, { status: 500 })
    }

    // システムフォルダの削除制限
    if (existingFolder.is_system) {
      return NextResponse.json({ 
        error: 'System folders cannot be deleted' 
      }, { status: 403 })
    }

    // スマートフォルダを削除
    const { error } = await supabase
      .from('smart_folders')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Smart folder deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete smart folder' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Smart folder deleted successfully' })

  } catch (error) {
    console.error('Smart folder deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}