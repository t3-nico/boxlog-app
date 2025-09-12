'use client'

import React from 'react'

import { CodeNode } from '@lexical/code'
import { $generateHtmlFromNodes , $generateNodesFromDOM } from '@lexical/html'
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
import {
  $getRoot,
  $getSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  $isRangeSelection,
} from 'lexical'

import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Heading2,
  Undo,
  Redo,
  CheckSquare
} from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { Separator } from '@/components/shadcn-ui/separator'
import { text, border } from '@/config/theme/colors'
import { cn } from '@/lib/utils'



const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  return (
    <div className={cn(
      'flex items-center gap-1 p-2 border-b overflow-x-auto',
      colors.background.surface,
      border.universal
    )}>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6 flex-shrink-0" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const heading = $createHeadingNode('h2')
                selection.insertNodes([heading])
              }
            })
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const list = $createListNode('bullet')
                const listItem = $createListItemNode()
                list.append(listItem)
                selection.insertNodes([list])
              }
            })
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const list = $createListNode('number')
                const listItem = $createListItemNode()
                list.append(listItem)
                selection.insertNodes([list])
              }
            })
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const list = $createListNode('check')
                const listItem = $createListItemNode()
                list.append(listItem)
                selection.insertNodes([list])
              }
            })
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const quote = $createQuoteNode()
                selection.insertNodes([quote])
              }
            })
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6 flex-shrink-0" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const HtmlPlugin = ({ initialHtml, onChange }: { initialHtml?: string, onChange?: (html: string) => void }) => {
  const [editor] = useLexicalComposerContext()

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

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null)
          onChange?.(htmlString)
        })
      }}
    />
  )
}

export interface EditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export const Editor = ({ value, onChange, placeholder = "入力してください...", className }: EditorProps) => {
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
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      CodeNode,
    ],
    onError: (error: Error) => {
      console.error(error)
    },
  }

  return (
    <div className={cn(
      'w-full max-w-full overflow-hidden rounded-lg border',
      colors.background.base,
      border.universal,
      className
    )}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative w-full max-w-full">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  'w-full max-w-full min-h-[100px] resize-none p-3 outline-none',
                  text.primary
                )}
              />
            }
            placeholder={
              <div className={cn(
                'absolute top-3 left-3 pointer-events-none',
                text.muted
              )}>
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS.filter(t => t.type !== 'code-block')} />
          <HtmlPlugin initialHtml={value} onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  )
}