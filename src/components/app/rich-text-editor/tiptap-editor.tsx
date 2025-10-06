'use client'

import React from 'react'

import './tiptap-styles.css'
import ListItem from '@tiptap/extension-list-item'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { Bold, Italic, Underline, List, ListOrdered, CheckSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'


interface TiptapEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export const TiptapEditor = ({ 
  value = '', 
  onChange, 
  placeholder = "入力してください...", 
  className 
}: TiptapEditorProps) => {
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
          'text-base',
          'text-neutral-900 dark:text-neutral-100',
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
      const {extensions} = editor.extensionManager
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
    <TooltipProvider>
      <div className={cn(
        'w-full border rounded-lg overflow-hidden relative max-w-full',
        'bg-neutral-100 dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-700',
        className
      )}>
        {/* ツールバー */}
        <div className={cn(
          'flex items-center gap-0 pl-2 pr-2 py-2 border-b overflow-x-auto',
          'bg-white dark:bg-neutral-800',
          'border-neutral-200 dark:border-neutral-700'
        )}>
          {/* テキスト装飾 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleBold}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('bold') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('bold') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>太字</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleItalic}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('italic') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('italic') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>斜体</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleUnderline}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('underline') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('underline') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>下線</p>
            </TooltipContent>
          </Tooltip>

        <div className={cn('w-px h-6 mx-1 flex-shrink-0 border-neutral-200 dark:border-neutral-700')} />

        {/* リスト */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleBulletList}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('bulletList') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('bulletList') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>箇条書き</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleOrderedList}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('orderedList') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('orderedList') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>番号付きリスト</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleTaskList}
                className={cn(
                  'h-8 !px-2 p-0 flex-shrink-0',
                  editor.isActive('taskList') && 'bg-blue-50 dark:bg-blue-900/30',
                  editor.isActive('taskList') && 'text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-300'
                )}
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>チェックリスト</p>
            </TooltipContent>
          </Tooltip>
      </div>

      {/* 編集エリア */}
      <div className="tiptap-editor-content">
        <EditorContent editor={editor} />
      </div>

      {/* プレースホルダー */}
      {editor.isEmpty === true && (
        <div className={cn(
          'absolute top-[60px] left-3 pointer-events-none',
          'text-neutral-600 dark:text-neutral-400',
          'text-base'
        )}>
          {placeholder}
        </div>
      )}
      </div>
    </TooltipProvider>
  )
}