'use client'

import React, { useCallback } from 'react'

import { CodeNode } from '@lexical/code'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { LinkNode } from '@lexical/link'
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list'
import { TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'

import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical'

import { Bold, CheckSquare, Heading2, Italic, List, ListOrdered, Quote, Redo, Underline, Undo } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { Separator } from '@/components/shadcn-ui/separator'
import { cn } from '@/lib/utils'

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  const handleBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }, [editor])

  const handleItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }, [editor])

  const handleUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }, [editor])

  const handleHeading = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode('h2')
        selection.insertNodes([heading])
      }
    })
  }, [editor])

  const handleBulletList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const list = $createListNode('bullet')
        const listItem = $createListItemNode()
        list.append(listItem)
        selection.insertNodes([list])
      }
    })
  }, [editor])

  const handleNumberedList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const list = $createListNode('number')
        const listItem = $createListItemNode()
        list.append(listItem)
        selection.insertNodes([list])
      }
    })
  }, [editor])

  const handleCheckList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const list = $createListNode('check')
        const listItem = $createListItemNode()
        list.append(listItem)
        selection.insertNodes([list])
      }
    })
  }, [editor])

  const handleQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const quote = $createQuoteNode()
        selection.insertNodes([quote])
      }
    })
  }, [editor])

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b p-2',
        'bg-white dark:bg-neutral-800',
        'border-neutral-200 dark:border-neutral-800'
      )}
    >
      <div className="flex flex-shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleBold} className="h-8 w-8 flex-shrink-0 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleItalic} className="h-8 w-8 flex-shrink-0 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleUnderline} className="h-8 w-8 flex-shrink-0 p-0">
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 flex-shrink-0" />

        <Button variant="ghost" size="sm" onClick={handleHeading} className="h-8 w-8 flex-shrink-0 p-0">
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleBulletList} className="h-8 w-8 flex-shrink-0 p-0">
          <List className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleNumberedList} className="h-8 w-8 flex-shrink-0 p-0">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleCheckList} className="h-8 w-8 flex-shrink-0 p-0">
          <CheckSquare className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleQuote} className="h-8 w-8 flex-shrink-0 p-0">
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6 flex-shrink-0" />

        <Button variant="ghost" size="sm" onClick={handleUndo} className="h-8 w-8 flex-shrink-0 p-0">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRedo} className="h-8 w-8 flex-shrink-0 p-0">
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const HtmlPlugin = ({ initialHtml, onChange }: { initialHtml?: string; onChange?: (html: string) => void }) => {
  const [editor] = useLexicalComposerContext()

  const handleEditorStateChange = useCallback(
    (editorState) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        onChange?.(htmlString)
      })
    },
    [editor, onChange]
  )

  React.useEffect(() => {
    if (initialHtml) {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(initialHtml, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        $getRoot().select()
        $getRoot().clear()
        $getRoot().append(...nodes)
      })
    }
  }, [editor, initialHtml])

  return <OnChangePlugin onChange={handleEditorStateChange} />
}

export interface EditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export const Editor = ({ value, onChange, placeholder = '入力してください...', className }: EditorProps) => {
  const initialConfig = {
    namespace: 'editor',
    theme: {
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
      heading: {
        h1: 'text-2xl font-bold',
        h2: 'text-xl font-bold',
        h3: 'text-lg font-bold',
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal list-inside',
        ul: 'list-disc list-inside',
        listitem: 'ml-4',
        checklist: 'list-none',
        listitemChecked: 'line-through opacity-60',
        listitemUnchecked: '',
      },
      quote: 'border-l-4 border-gray-300 pl-4 italic',
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
    onError: (error: Error) => {
      console.error(error)
    },
  }

  return (
    <div
      className={cn(
        'w-full max-w-full overflow-hidden rounded-lg border',
        'bg-neutral-100 dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative w-full max-w-full">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn('min-h-[100px] w-full max-w-full resize-none p-3 outline-none text-neutral-900 dark:text-neutral-100')}
              />
            }
            placeholder={
              <div className={cn('pointer-events-none absolute left-3 top-3 text-neutral-600 dark:text-neutral-400')}>{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS.filter((t) => t.type !== 'code-block')} />
          <HtmlPlugin initialHtml={value} onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  )
}
