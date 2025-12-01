'use client'

import { useCallback } from 'react'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Quote } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minimal?: boolean
}

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Add description...',
  className,
  minimal = false,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none min-h-14 px-3 py-2',
          // Custom styles for editor content
          '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2',
          '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2',
          '[&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-2',
          '[&_p]:mb-2',
          '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2',
          '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2',
          '[&_li]:mb-1',
          '[&_strong]:font-bold',
          '[&_em]:italic',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-2'
        ),
      },
    },
  })

  const toggleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run()
    }
  }, [editor])

  const toggleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run()
    }
  }, [editor])

  const toggleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run()
    }
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run()
    }
  }, [editor])

  const toggleBlockquote = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run()
    }
  }, [editor])

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run()
      }
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  return (
    <div className={cn('rounded-md border', className)}>
      {!minimal && (
        <div className="flex items-center gap-1 border-b px-2 py-1">
          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleHeading(1)}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleHeading(2)}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleHeading(3)}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="bg-border mx-1 h-6 w-px" />

          {/* Text formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleBold}
            className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleItalic}
            className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
          >
            <Italic className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="bg-border mx-1 h-6 w-px" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleBulletList}
            className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleOrderedList}
            className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="bg-border mx-1 h-6 w-px" />

          {/* Quote */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleBlockquote}
            className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-muted')}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="max-h-[25rem] min-h-20 resize-y overflow-auto" />
    </div>
  )
}
