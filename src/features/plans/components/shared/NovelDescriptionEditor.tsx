'use client'

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  handleCommandNavigation,
} from 'novel'
import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultExtensions } from './extensions'
import { slashCommand, suggestionItems } from './slash-command'

interface NovelDescriptionEditorProps {
  content?: string
  onChange: (content: string) => void
  placeholder?: string
}

/**
 * Novel エディター統合コンポーネント
 *
 * Notionライクなリッチテキストエディターを提供
 * - スラッシュコマンド（/）でブロック挿入
 * - Markdownショートカット対応
 * - バブルメニュー（テキスト選択時）
 */
export function NovelDescriptionEditor({
  content,
  onChange,
  placeholder = 'Add description...',
}: NovelDescriptionEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const extensions = useMemo(() => [...defaultExtensions, slashCommand], [])

  const editorProps = useMemo(
    () => ({
      handleDOMEvents: {
        keydown: (_view: unknown, event: KeyboardEvent) => handleCommandNavigation(event),
      },
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-full',
        'data-placeholder': placeholder,
      },
    }),
    [placeholder]
  )

  // 初期HTMLコンテンツをエディターに設定
  useEffect(() => {
    if (editorRef.current && content && !isLoaded) {
      editorRef.current.commands.setContent(content)

      setIsLoaded(true)
    }
  }, [content, isLoaded])

  return (
    <div
      className="scrollbar-thin max-h-52 overflow-y-auto"
      style={{
        scrollbarColor: 'color-mix(in oklch, var(--color-muted-foreground) 30%, transparent) transparent',
      }}
    >
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- novel内部の@tiptap/coreとルートの型が競合するため
          extensions={extensions as any}
          editorProps={editorProps}
          onCreate={({ editor }: { editor: EditorInstance }) => {
            editorRef.current = editor
            // 初期コンテンツを設定
            if (content) {
              editor.commands.setContent(content)
            }
          }}
          onUpdate={({ editor }: { editor: EditorInstance }) => {
            // HTML形式で保存
            const html = editor.getHTML()
            onChange(html)
          }}
          className="text-muted-foreground min-h-[1.5rem] border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        >
          <EditorCommand className="novel-command-menu bg-popover border-border z-50 h-auto max-h-80 overflow-y-auto rounded-md border shadow-md transition-all">
            <EditorCommandEmpty className="text-muted-foreground px-3 py-2 text-sm">No results</EditorCommandEmpty>
            <EditorCommandList className="bg-popover p-1">
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  key={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="hover:bg-state-hover aria-selected:bg-state-selected flex w-full cursor-pointer items-center space-x-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
                >
                  <div className="border-border bg-card flex h-10 w-10 items-center justify-center rounded-md border">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
