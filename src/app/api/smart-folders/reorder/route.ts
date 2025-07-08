// Smart Folders 順序変更 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reorderSmartFoldersSchema } from '@/lib/validations/smart-folders'

// PUT /api/smart-folders/reorder - スマートフォルダの順序変更
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディの検証
    const body = await request.json()
    const validatedData = reorderSmartFoldersSchema.parse(body)

    // バッチ更新でフォルダの順序を更新
    const updatePromises = validatedData.folderOrders.map(({ id, orderIndex }) =>
      supabase
        .from('smart_folders')
        .update({ order_index: orderIndex })
        .eq('id', id)
        .eq('user_id', user.id)
    )

    const results = await Promise.all(updatePromises)
    
    // エラーチェック
    for (const result of results) {
      if (result.error) {
        console.error('Reorder error:', result.error)
        return NextResponse.json({ error: 'Failed to reorder smart folders' }, { status: 500 })
      }
    }

    return NextResponse.json({ message: 'Smart folders reordered successfully' })

  } catch (error) {
    console.error('Smart folder reorder API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}