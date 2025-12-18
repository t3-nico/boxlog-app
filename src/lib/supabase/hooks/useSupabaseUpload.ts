/**
 * useSupabaseUpload - Supabase Storage ファイルアップロードフック
 *
 * Supabase UI Library のパターンを参考に、BoxLog用に最適化
 *
 * @see https://supabase.com/ui/docs/nextjs/dropzone
 *
 * 使用例:
 * ```tsx
 * const uploadProps = useSupabaseUpload({
 *   bucketName: 'attachments',
 *   path: 'plans/123',
 *   allowedMimeTypes: ['image/*', 'application/pdf'],
 *   maxFiles: 5,
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 * })
 *
 * return (
 *   <Dropzone {...uploadProps}>
 *     <DropzoneEmptyState />
 *     <DropzoneContent />
 *   </Dropzone>
 * )
 * ```
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'

import { createClient } from '@/lib/supabase/client'

/**
 * プレビュー付きファイル
 */
interface FileWithPreview extends File {
  preview: string | undefined
  errors: readonly FileError[]
}

/**
 * アップロードエラー
 */
interface UploadError {
  name: string
  message: string
}

/**
 * useSupabaseUpload オプション
 */
interface UseSupabaseUploadOptions {
  /** バケット名 */
  bucketName: string
  /** アップロード先パス（フォルダ） */
  path?: string
  /** 許可するMIMEタイプ（例: ['image/*', 'application/pdf']） */
  allowedMimeTypes?: string[]
  /** 最大ファイルサイズ（バイト） */
  maxFileSize?: number
  /** 最大ファイル数 */
  maxFiles?: number
  /** キャッシュ制御（秒） */
  cacheControl?: number
  /** 上書きを許可 */
  upsert?: boolean
  /** アップロード成功時のコールバック */
  onUploadSuccess?: (files: Array<{ name: string; url: string }>) => void
  /** アップロードエラー時のコールバック */
  onUploadError?: (error: UploadError) => void
}

/**
 * useSupabaseUpload 戻り値
 */
type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>

/**
 * Supabase Storage ファイルアップロードフック
 */
function useSupabaseUpload(options: UseSupabaseUploadOptions) {
  const {
    bucketName,
    path = '',
    allowedMimeTypes = [],
    maxFileSize = 10 * 1024 * 1024, // デフォルト10MB
    maxFiles = 10,
    cacheControl = 3600,
    upsert = false,
    onUploadSuccess,
    onUploadError,
  } = options

  // 状態管理
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<UploadError[]>([])
  const [successes, setSuccesses] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 成功判定
  const isSuccess = useMemo(() => {
    return files.length > 0 && files.every((file) => successes.includes(file.name))
  }, [files, successes])

  // ファイルドロップ時のハンドラ
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // 受け入れられたファイルにプレビューを追加
      const filesWithPreview: FileWithPreview[] = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          errors: [] as readonly FileError[],
        })
      )

      // 拒否されたファイルをエラー付きで追加
      const rejectedFilesWithErrors: FileWithPreview[] = rejectedFiles.map((rejection) =>
        Object.assign(rejection.file, {
          preview: rejection.file.type.startsWith('image/')
            ? URL.createObjectURL(rejection.file)
            : undefined,
          errors: rejection.errors,
        })
      )

      setFiles((prev) => [...prev, ...filesWithPreview, ...rejectedFilesWithErrors])

      // エラーと成功をリセット
      setErrors([])
      setSuccesses([])
    },
    []
  )

  // dropzone 設定
  const dropzoneOptions = useMemo(() => {
    const baseOptions = {
      onDrop,
      maxSize: maxFileSize,
      maxFiles,
      multiple: maxFiles > 1,
    }

    // acceptが必要な場合のみ追加
    if (allowedMimeTypes.length > 0) {
      return {
        ...baseOptions,
        accept: parseAcceptTypes(allowedMimeTypes),
      }
    }

    return baseOptions
  }, [onDrop, maxFileSize, maxFiles, allowedMimeTypes])

  const dropzone = useDropzone(dropzoneOptions)

  // アップロード処理
  const onUpload = useCallback(async () => {
    // バリデーションエラーがあるファイルを除外
    const validFiles = files.filter((file) => file.errors.length === 0)

    if (validFiles.length === 0) {
      return
    }

    setLoading(true)
    setErrors([])

    const supabase = createClient()
    const uploadResults: Array<{ name: string; url: string }> = []
    const uploadErrors: UploadError[] = []

    // 並列アップロード
    await Promise.all(
      validFiles.map(async (file) => {
        // すでにアップロード済みの場合はスキップ
        if (successes.includes(file.name)) {
          return
        }

        const filePath = path ? `${path}/${file.name}` : file.name

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
          cacheControl: cacheControl.toString(),
          upsert,
        })

        if (uploadError) {
          uploadErrors.push({
            name: file.name,
            message: uploadError.message,
          })
          onUploadError?.({ name: file.name, message: uploadError.message })
        } else {
          // 公開URLを取得
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucketName).getPublicUrl(filePath)

          uploadResults.push({ name: file.name, url: publicUrl })
          setSuccesses((prev) => [...prev, file.name])
        }
      })
    )

    setErrors(uploadErrors)
    setLoading(false)

    if (uploadResults.length > 0) {
      onUploadSuccess?.(uploadResults)
    }
  }, [
    files,
    successes,
    bucketName,
    path,
    cacheControl,
    upsert,
    onUploadSuccess,
    onUploadError,
  ])

  // プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  return {
    // ファイル状態
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,

    // アップロード関数
    onUpload,

    // 設定値
    maxFileSize,
    maxFiles,
    allowedMimeTypes,

    // dropzone props
    ...dropzone,
    inputRef,
  }
}

/**
 * MIMEタイプ配列をreact-dropzoneのacceptフォーマットに変換
 */
function parseAcceptTypes(mimeTypes: string[]): Record<string, string[]> {
  const accept: Record<string, string[]> = {}

  mimeTypes.forEach((type) => {
    // ワイルドカード対応（例: image/*）
    if (type.endsWith('/*')) {
      const category = type.replace('/*', '')
      // 一般的な拡張子をマッピング
      const extensionMap: Record<string, string[]> = {
        image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
        video: ['.mp4', '.webm', '.mov', '.avi'],
        audio: ['.mp3', '.wav', '.ogg', '.m4a'],
        text: ['.txt', '.csv', '.json', '.xml'],
        application: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'],
      }
      accept[type] = extensionMap[category] || []
    } else {
      // 具体的なMIMEタイプ
      accept[type] = []
    }
  })

  return accept
}

export { useSupabaseUpload }
export type { UseSupabaseUploadOptions, UseSupabaseUploadReturn, FileWithPreview, UploadError }
