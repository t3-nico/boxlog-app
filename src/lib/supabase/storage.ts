/**
 * Supabase Storage ヘルパー関数
 * アバター画像のアップロード・削除を管理
 */

import { createClient } from './client'

const AVATARS_BUCKET = 'avatars'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * アバター画像をアップロード
 * @param file - アップロードする画像ファイル
 * @param userId - ユーザーID
 * @returns アップロードされた画像の公開URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient()

  // ファイルバリデーション
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルのみアップロード可能です')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ファイルサイズは5MB以下にしてください')
  }

  // ファイル拡張子を取得
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  // 既存のアバターを削除（あれば）
  try {
    await supabase.storage.from(AVATARS_BUCKET).remove([fileName])
  } catch (error) {
    // 既存ファイルがない場合はエラーを無視
    console.log('No existing avatar to delete')
  }

  // 新しいアバターをアップロード
  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (uploadError) {
    console.error('Upload error details:', {
      message: uploadError.message,
      statusCode: uploadError.statusCode,
      error: uploadError,
      bucket: AVATARS_BUCKET,
      fileName: fileName,
    })
    throw new Error(`アップロードに失敗しました: ${uploadError.message}`)
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(fileName)

  return publicUrl
}

/**
 * アバター画像を削除
 * @param userId - ユーザーID
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = createClient()

  // ユーザーのフォルダ内のすべてのファイルを取得
  const { data: files, error: listError } = await supabase.storage.from(AVATARS_BUCKET).list(userId)

  if (listError) {
    console.error('List error:', listError)
    throw new Error(`ファイル一覧の取得に失敗しました: ${listError.message}`)
  }

  if (!files || files.length === 0) {
    return // 削除するファイルがない
  }

  // すべてのファイルを削除
  const filePaths = files.map((file) => `${userId}/${file.name}`)
  const { error: deleteError } = await supabase.storage.from(AVATARS_BUCKET).remove(filePaths)

  if (deleteError) {
    console.error('Delete error:', deleteError)
    throw new Error(`削除に失敗しました: ${deleteError.message}`)
  }
}
