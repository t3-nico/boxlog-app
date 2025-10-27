'use client'

import '@uiw/react-markdown-preview/markdown.css'
import '@uiw/react-md-editor/markdown-editor.css'
import dynamic from 'next/dynamic'
import { forwardRef } from 'react'

// MDEditorを動的インポート（SSR回避）
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <div className="text-muted-foreground rounded-md border p-4">読み込み中...</div>,
})

interface MarkdownEditorProps {
  value?: string
  onChange?: (value?: string) => void
  placeholder?: string
  height?: number
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  ({ value, onChange, placeholder = 'Markdown形式で入力...', height = 300 }, ref) => {
    return (
      <div ref={ref} className="markdown-editor-wrapper">
        <MDEditor
          value={value}
          onChange={onChange}
          height={height}
          preview="edit"
          hideToolbar={false}
          enableScroll={true}
          textareaProps={{
            placeholder,
          }}
        />
      </div>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'
