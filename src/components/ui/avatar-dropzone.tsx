/**
 * AvatarDropzone - アバター画像アップロード専用コンポーネント
 *
 * プロフィール画像のアップロードに特化したDropzone
 * - 単一画像のみ
 * - 円形プレビュー
 * - ドラッグ&ドロップ対応
 *
 * 使用例:
 * ```tsx
 * <AvatarDropzone
 *   currentAvatarUrl={user?.avatar_url}
 *   onUpload={handleUpload}
 *   onRemove={handleRemove}
 *   isUploading={isUploading}
 * />
 * ```
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import { Camera, Loader2, Trash2, Upload, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { type FileRejection, useDropzone } from 'react-dropzone'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AvatarDropzoneProps {
  /** 現在のアバターURL */
  currentAvatarUrl?: string | null
  /** アップロード時のコールバック */
  onUpload: (file: File) => Promise<void>
  /** 削除時のコールバック */
  onRemove?: () => Promise<void>
  /** アップロード中フラグ */
  isUploading?: boolean
  /** 最大ファイルサイズ（バイト） */
  maxFileSize?: number
  /** サイズ（px） */
  size?: number
  /** 無効化 */
  disabled?: boolean
  /** クラス名 */
  className?: string
}

/**
 * アバター画像アップロード専用Dropzone
 */
function AvatarDropzone({
  currentAvatarUrl,
  onUpload,
  onRemove,
  isUploading = false,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  size = 96,
  disabled = false,
  className,
}: AvatarDropzoneProps) {
  const t = useTranslations('avatarDropzone')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 表示するアバターURL（プレビュー優先）
  const displayUrl = previewUrl || currentAvatarUrl

  // ファイルドロップ時のハンドラ
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)

      // プレビュー表示
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      try {
        await onUpload(file)
      } catch (err) {
        // エラー時はプレビューをクリア
        setPreviewUrl(null)
        setError(err instanceof Error ? err.message : t('uploadFailed'))
      } finally {
        // プレビューURLをクリーンアップ
        URL.revokeObjectURL(preview)
        setPreviewUrl(null)
      }
    },
    [onUpload, t]
  )

  // Dropzone設定
  const dropzoneOptions = useMemo(
    () => ({
      onDrop,
      accept: {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      },
      maxSize: maxFileSize,
      maxFiles: 1,
      multiple: false,
      disabled: disabled || isUploading,
      onDropRejected: (rejections: FileRejection[]) => {
        const rejection = rejections[0]
        if (rejection?.errors[0]?.code === 'file-too-large') {
          setError(t('fileTooLarge', { maxSize: formatBytes(maxFileSize) }))
        } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
          setError(t('invalidFileType'))
        } else {
          setError(t('uploadFailed'))
        }
      },
    }),
    [onDrop, maxFileSize, disabled, isUploading, t]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions)

  // 削除ハンドラ
  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!onRemove) return

      const confirmed = window.confirm(t('deleteConfirm'))
      if (!confirmed) return

      setError(null)
      try {
        await onRemove()
      } catch (err) {
        setError(err instanceof Error ? err.message : t('deleteFailed'))
      }
    },
    [onRemove, t]
  )

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* アバター表示エリア */}
      <div
        {...getRootProps({
          className: cn(
            'group relative cursor-pointer rounded-full transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragActive && 'ring-2 ring-primary ring-offset-2',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          ),
          style: { width: size, height: size },
        })}
      >
        <input {...getInputProps()} />

        {/* アバター画像またはプレースホルダー */}
        {displayUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              src={displayUrl}
              alt={t('avatarAlt')}
              fill
              className="object-cover"
              sizes={`${size}px`}
              unoptimized={displayUrl.startsWith('blob:')}
            />
            {/* ホバーオーバーレイ */}
            {!isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center rounded-full',
              'border-2 border-dashed transition-colors',
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted hover:border-primary/50 hover:bg-muted/80'
            )}
          >
            {isDragActive ? (
              <Upload className="text-primary h-8 w-8" />
            ) : (
              <User className="text-muted-foreground h-8 w-8" />
            )}
          </div>
        )}

        {/* ローディングオーバーレイ */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* 操作ボタン */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('input[type="file"]')
            input?.click()
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              {t('uploading')}
            </>
          ) : (
            <>
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              {displayUrl ? t('change') : t('upload')}
            </>
          )}
        </Button>

        {displayUrl && onRemove && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isUploading}
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {t('remove')}
          </Button>
        )}
      </div>

      {/* ファイル制限の説明 */}
      <p className="text-muted-foreground text-xs">{t('fileRequirements', { maxSize: formatBytes(maxFileSize) })}</p>

      {/* エラー表示 */}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

/**
 * バイト数をフォーマット
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 bytes'
  const k = 1000
  const sizes = ['bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`
}

export { AvatarDropzone }
export type { AvatarDropzoneProps }
