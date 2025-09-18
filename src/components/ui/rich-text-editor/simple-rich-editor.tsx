'use client'

import React, { useCallback } from 'react'

import { Bold, CheckSquare, Italic, Link, List, ListOrdered, Underline } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import { sanitizeRichText } from '@/lib/security/sanitize'
import { cn } from '@/lib/utils'

interface SimpleRichEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export const SimpleRichEditor = ({
  value = '',
  onChange,
  placeholder = '入力してください...',
  className,
}: SimpleRichEditorProps) => {
  const editorRef = React.useRef<HTMLDivElement>(null)

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.innerHTML
      onChange?.(newContent)
    },
    [onChange]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Enterキーでの改行を適切に処理
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertLineBreak', false)
    }
  }, [])

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML
        onChange?.(newContent)
      }
    },
    [onChange]
  )

  const formatText = useCallback(
    (command: string) => {
      execCommand(command)
    },
    [execCommand]
  )

  const insertList = useCallback(
    (ordered: boolean) => {
      execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList')
    },
    [execCommand]
  )

  const insertCheckList = useCallback(() => {
    // チェックリストの簡単な実装
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const checklistItem = document.createElement('div')
      checklistItem.innerHTML = '☐ '
      checklistItem.style.marginBottom = '4px'
      range.insertNode(checklistItem)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)

      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML
        onChange?.(newContent)
      }
    }
  }, [onChange])

  const insertLink = useCallback(() => {
    const url = prompt('URLを入力してください:')
    if (url) {
      const text = window.getSelection()?.toString() || url
      execCommand('createLink', url)
      // リンクテキストが選択されていない場合はURLをテキストとして使用
      if (!window.getSelection()?.toString()) {
        document.execCommand('insertText', false, text)
      }
    }
  }, [execCommand])

  // valueが外部から変更された場合の同期
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  // 空のコンテンツをチェックする関数
  const isEmpty = (htmlContent: string) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim() === ''
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border',
        colors.background.base,
        border.universal,
        className
      )}
    >
      {/* ツールバー */}
      <div
        className={cn(
          'flex items-center gap-1 overflow-x-auto border-b p-2',
          colors.background.surface,
          border.universal
        )}
      >
        {/* テキスト装飾 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="太字"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="斜体"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('underline')}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="下線"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className={cn('mx-1 h-6 w-px flex-shrink-0', border.universal)} />

        {/* リスト */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(false)}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="箇条書き"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(true)}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="番号付きリスト"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertCheckList}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="チェックリスト"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <div className={cn('mx-1 h-6 w-px flex-shrink-0', border.universal)} />

        {/* リンク */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 flex-shrink-0 p-0"
          title="リンク"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* 編集エリア */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(value || '') }}
        role="textbox"
        aria-label="Rich text editor"
        tabIndex={0}
        className={cn(
          'min-h-[120px] w-full resize-none p-3 outline-none',
          'focus:ring-ring focus:ring-2 focus:ring-offset-2',
          typography.body.DEFAULT,
          text.primary,
          'prose prose-sm max-w-none',
          '[&_b]:font-bold [&_strong]:font-bold',
          '[&_em]:italic [&_i]:italic',
          '[&_u]:underline',
          '[&_ul]:my-2 [&_ul]:list-inside [&_ul]:list-disc',
          '[&_ol]:my-2 [&_ol]:list-inside [&_ol]:list-decimal',
          '[&_li]:my-1',
          '[&_a:hover]:text-blue-800 [&_a]:text-blue-600 [&_a]:underline',
          '[&_a:hover]:dark:text-blue-200 [&_a]:dark:text-blue-400',
          '[&_div]:my-1'
        )}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      />

      {/* プレースホルダー */}
      {isEmpty(value) && (
        <div className={cn('pointer-events-none absolute left-3 top-[52px]', text.muted, typography.body.DEFAULT)}>
          {placeholder}
        </div>
      )}
    </div>
  )
}
