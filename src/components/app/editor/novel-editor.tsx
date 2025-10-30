'use client'

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  type JSONContent,
} from 'novel'
import { useState } from 'react'

interface NovelEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Novel エディタコンポーネント
 *
 * Vercel公式推奨のNotion風WYSIWYGエディタ
 * - スラッシュコマンド対応
 * - AI統合済み（将来的に利用可能）
 * - shadcn/uiスタイル準拠
 */
export function NovelEditor({ value = '', onChange, placeholder = '説明を入力...', className }: NovelEditorProps) {
  const [content, setContent] = useState<JSONContent | undefined>(
    value
      ? {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: value }],
            },
          ],
        }
      : undefined
  )

  const handleUpdate = (editor: { getHTML: () => string }) => {
    const html = editor.getHTML()
    onChange?.(html)
  }

  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        onUpdate={({ editor }) => handleUpdate(editor as { getHTML: () => string })}
        className={className}
        placeholder={placeholder}
        editorProps={{
          attributes: {
            class:
              'prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[200px] p-4 border border-border rounded-md bg-background',
          },
        }}
      >
        <EditorCommand className="border-muted bg-background z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="text-muted-foreground px-2">コマンドが見つかりません</EditorCommandEmpty>
          <EditorCommandList>
            <EditorCommandItem
              value="heading-1"
              onCommand={(val) => val.chain().focus().toggleHeading({ level: 1 }).run()}
              className="hover:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-lg font-bold">H1</span>
              </div>
              <div>
                <p className="font-medium">見出し1</p>
                <p className="text-muted-foreground text-xs">大見出し</p>
              </div>
            </EditorCommandItem>
            <EditorCommandItem
              value="heading-2"
              onCommand={(val) => val.chain().focus().toggleHeading({ level: 2 }).run()}
              className="hover:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-base font-bold">H2</span>
              </div>
              <div>
                <p className="font-medium">見出し2</p>
                <p className="text-muted-foreground text-xs">中見出し</p>
              </div>
            </EditorCommandItem>
            <EditorCommandItem
              value="heading-3"
              onCommand={(val) => val.chain().focus().toggleHeading({ level: 3 }).run()}
              className="hover:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-sm font-bold">H3</span>
              </div>
              <div>
                <p className="font-medium">見出し3</p>
                <p className="text-muted-foreground text-xs">小見出し</p>
              </div>
            </EditorCommandItem>
            <EditorCommandItem
              value="bullet-list"
              onCommand={(val) => val.chain().focus().toggleBulletList().run()}
              className="hover:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-lg">•</span>
              </div>
              <div>
                <p className="font-medium">箇条書きリスト</p>
                <p className="text-muted-foreground text-xs">シンプルなリスト</p>
              </div>
            </EditorCommandItem>
            <EditorCommandItem
              value="numbered-list"
              onCommand={(val) => val.chain().focus().toggleOrderedList().run()}
              className="hover:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <span className="text-sm">1.</span>
              </div>
              <div>
                <p className="font-medium">番号付きリスト</p>
                <p className="text-muted-foreground text-xs">順序付きリスト</p>
              </div>
            </EditorCommandItem>
          </EditorCommandList>
        </EditorCommand>
      </EditorContent>
    </EditorRoot>
  )
}
