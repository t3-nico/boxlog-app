'use client'

import React from 'react'
import './tiptap-styles.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ListItem from '@tiptap/extension-list-item'
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
      StarterKit.configure({
        listItem: false, // StarterKitのListItemを無効化
      }),
      ListItem,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
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
          'w-full min-h-[120px] pl-3 pr-3 py-3 outline-none',
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

  // デバッグ: TaskListが正しくレンダリングされているか確認
  React.useEffect(() => {
    if (editor) {
      console.log('Editor initialized with TaskList/TaskItem extensions')
      const extensions = editor.extensionManager.extensions
      console.log('Extensions:', extensions.map(ext => ext.name))
    }
  }, [editor])

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
      'w-full border rounded-lg overflow-hidden relative max-w-full',
      background.base,
      border.universal,
      className
    )}>
      {/* ツールバー */}
      <div className={cn(
        'flex items-center gap-0 pl-2 pr-2 py-2 border-b overflow-x-auto',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
            'h-8 !px-2 p-0 flex-shrink-0',
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
          'absolute top-[60px] left-3 pointer-events-none',
          text.muted,
          typography.body.DEFAULT
        )}>
          {placeholder}
        </div>
      )}
    </div>
  )
}