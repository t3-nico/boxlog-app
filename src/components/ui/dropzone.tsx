/**
 * Dropzone - ファイルアップロードコンポーネント
 *
 * Supabase UI Library のパターンを参考に、BoxLog用に最適化
 * - i18n対応
 * - globals.css セマンティックトークン使用
 * - アクセシビリティ対応
 *
 * @see https://supabase.com/ui/docs/nextjs/dropzone
 *
 * 使用例:
 * ```tsx
 * import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone'
 * import { useSupabaseUpload } from '@/lib/supabase/hooks/useSupabaseUpload'
 *
 * function FileUpload() {
 *   const props = useSupabaseUpload({
 *     bucketName: 'attachments',
 *     path: 'plans/123',
 *   })
 *
 *   return (
 *     <Dropzone {...props}>
 *       <DropzoneEmptyState />
 *       <DropzoneContent />
 *     </Dropzone>
 *   )
 * }
 * ```
 */

'use client'

import { createContext, type PropsWithChildren, useCallback, useContext } from 'react'

import { CheckCircle, File, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import type { UseSupabaseUploadReturn } from '@/lib/supabase/hooks/useSupabaseUpload'
import { cn } from '@/lib/utils'

/**
 * バイト数をフォーマット（例: 1024 → "1 KB"）
 */
function formatBytes(
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB'
): string {
  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0 || bytes === undefined) {
    return size !== undefined ? `0 ${size}` : '0 bytes'
  }

  const i = size !== undefined ? sizes.indexOf(size) : Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// コンテキスト型（getRootProps, getInputPropsを除外）
type DropzoneContextType = Omit<UseSupabaseUploadReturn, 'getRootProps' | 'getInputProps'>

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined)

// Dropzone プロパティ
type DropzoneProps = UseSupabaseUploadReturn & {
  className?: string
}

/**
 * Dropzone コンテナコンポーネント
 */
function Dropzone({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) {
  const isSuccess = restProps.isSuccess
  const isActive = restProps.isDragActive
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0)

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            // 基本スタイル（セマンティックトークン使用）
            'rounded-lg border-2 p-6 text-center transition-colors duration-300',
            'bg-card text-card-foreground',
            // 境界線スタイル
            isSuccess ? 'border-solid border-primary' : 'border-dashed border-border',
            // アクティブ状態
            isActive && 'border-primary bg-primary/10',
            // エラー状態
            isInvalid && 'border-destructive bg-destructive/10',
            className
          ),
        })}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  )
}

/**
 * Dropzone コンテンツ（ファイルリスト表示）
 */
function DropzoneContent({ className }: { className?: string }) {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext()
  const t = useTranslations('dropzone')

  const exceedMaxFiles = files.length > maxFiles

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName))
    },
    [files, setFiles]
  )

  // 成功状態
  if (isSuccess) {
    return (
      <div className={cn('flex flex-row items-center justify-center gap-x-2', className)}>
        <CheckCircle size={16} className="text-primary" />
        <p className="text-primary text-sm">
          {t('uploadSuccess', { count: files.length })}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name)
        const isSuccessfullyUploaded = successes.includes(file.name)

        return (
          <div
            key={`${file.name}-${idx}`}
            className="border-border flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4"
          >
            {/* ファイルアイコン/プレビュー */}
            {file.type.startsWith('image/') && file.preview ? (
              <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                <Image
                  src={file.preview}
                  alt={file.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded border">
                <File size={18} />
              </div>
            )}

            {/* ファイル情報 */}
            <div className="flex shrink grow flex-col items-start truncate">
              <p title={file.name} className="max-w-full truncate text-sm">
                {file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-destructive text-xs">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith('File is larger than')
                        ? t('fileTooLarge', {
                            maxSize: formatBytes(maxFileSize, 2),
                            actualSize: formatBytes(file.size, 2),
                          })
                        : e.message
                    )
                    .join(', ')}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-muted-foreground text-xs">{t('uploading')}</p>
              ) : fileError ? (
                <p className="text-destructive text-xs">
                  {t('uploadFailed', { message: fileError.message })}
                </p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-primary text-xs">{t('uploadedSuccess')}</p>
              ) : (
                <p className="text-muted-foreground text-xs">{formatBytes(file.size, 2)}</p>
              )}
            </div>

            {/* 削除ボタン */}
            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground shrink-0 justify-self-end"
                onClick={() => handleRemoveFile(file.name)}
                aria-label={t('removeFile')}
              >
                <X />
              </Button>
            )}
          </div>
        )
      })}

      {/* ファイル数超過警告 */}
      {exceedMaxFiles && (
        <p className="text-destructive mt-2 text-left text-sm">
          {t('maxFilesExceeded', {
            maxFiles,
            removeCount: files.length - maxFiles,
          })}
        </p>
      )}

      {/* アップロードボタン */}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={onUpload}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('uploadingButton')}
              </>
            ) : (
              t('uploadButton')
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Dropzone 空状態（初期表示）
 */
function DropzoneEmptyState({ className }: { className?: string }) {
  const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext()
  const t = useTranslations('dropzone')

  // 成功時は非表示
  if (isSuccess) {
    return null
  }

  return (
    <div className={cn('flex flex-col items-center gap-y-2', className)}>
      <Upload size={20} className="text-muted-foreground" />
      <p className="text-sm">
        {maxFiles && maxFiles > 1
          ? t('uploadFilesWithCount', { count: maxFiles })
          : t('uploadFile')}
      </p>
      <div className="flex flex-col items-center gap-y-1">
        <p className="text-muted-foreground text-xs">
          {t('dragAndDrop')}{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="hover:text-foreground cursor-pointer underline transition"
          >
            {maxFiles === 1 ? t('selectFile') : t('selectFiles')}
          </button>{' '}
          {t('toUpload')}
        </p>
        {maxFileSize !== Number.POSITIVE_INFINITY && (
          <p className="text-muted-foreground text-xs">
            {t('maxFileSize', { size: formatBytes(maxFileSize, 2) })}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Dropzoneコンテキストフック
 */
function useDropzoneContext(): DropzoneContextType {
  const context = useContext(DropzoneContext)

  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone')
  }

  return context
}

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext, formatBytes }
