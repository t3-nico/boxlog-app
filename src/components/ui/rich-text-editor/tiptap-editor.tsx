'use client'

import React from 'react'
import './tiptap-styles.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadcn-ui/button'
import { Bold, Italic, Underline, List, ListOrdered, CheckSquare } from 'lucide-react'
import { background, text, border } from '@/config/theme/colors'
import { typography } from '@/config/theme'

interface TiptapEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({ 
  value = '', 
  onChange, 
  placeholder = "入力してください...", 
  className 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'w-full min-h-[120px] p-3 outline-none',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2',
          typography.body.DEFAULT,
          text.primary,
          'ProseMirror'
        ),
        style: 'word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;'
      },
    },
  })

  // 外部からのvalue変更を反映
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline?.().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleTaskList = () => editor?.chain().focus().toggleTaskList().run()

  if (!editor) {
    return null
  }

  return (
    <div className={cn(
      'w-full border rounded-lg overflow-hidden relative',
      background.base,
      border.universal,
      className
    )}>
      {/* ツールバー */}
      <div className={cn(
        'flex items-center gap-1 p-2 border-b overflow-x-auto',
        background.surface,
        border.universal
      )}>
        {/* テキスト装飾 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('bold') && 'bg-accent'
          )}
          title="太字"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('italic') && 'bg-accent'
          )}
          title="斜体"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleUnderline}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('underline') && 'bg-accent'
          )}
          title="下線"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className={cn('w-px h-6 mx-1 flex-shrink-0', border.universal)} />
        
        {/* リスト */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('bulletList') && 'bg-accent'
          )}
          title="箇条書き"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleOrderedList}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('orderedList') && 'bg-accent'
          )}
          title="番号付きリスト"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleTaskList}
          className={cn(
            'h-8 w-8 p-0 flex-shrink-0',
            editor.isActive('taskList') && 'bg-accent'
          )}
          title="チェックリスト"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      </div>

      {/* 編集エリア */}
      <div className="tiptap-editor-content">
        <EditorContent editor={editor} />
      </div>
      
      {/* プレースホルダー */}
      {editor.isEmpty && (
        <div className={cn(
          'absolute top-[52px] left-3 pointer-events-none',
          text.muted,
          typography.body.DEFAULT
        )}>
          {placeholder}
        </div>
      )}
    </div>
  )
}