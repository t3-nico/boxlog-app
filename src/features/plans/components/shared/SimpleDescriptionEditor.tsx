'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  CheckSquare,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SimpleDescriptionEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * シンプルな説明文エディター（Google Calendar風）
 *
 * - ミニツールバー（Bold/Italic/Underline/Link）
 * - tiptap直接使用で軽量
 * - ポップアップ内での使用に最適化
 */
export function SimpleDescriptionEditor({
  content,
  onChange,
  placeholder = '説明を追加...',
  autoFocus = false,
}: SimpleDescriptionEditorProps) {
  const lastContentRef = useRef<string | undefined>(content);

  // Extensions をメモ化（再レンダリング時の再生成を防止）
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'leading-normal',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 cursor-pointer',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-0',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
        nested: true,
      }),
      Placeholder.configure({
        placeholder: ({ editor: ed }) => {
          const isEmpty = ed.state.doc.textContent.length === 0;
          return isEmpty ? placeholder : '';
        },
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'text-sm text-foreground focus:outline-none px-3 py-2 [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1',
      },
    },
    immediatelyRender: false,
  });

  // 自動フォーカス
  useEffect(() => {
    if (autoFocus && editor) {
      setTimeout(() => {
        editor.commands.focus('end');
      }, 50);
    }
  }, [autoFocus, editor]);

  // 外部からcontentが変更された場合に同期
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content || '');
      }
      lastContentRef.current = content;
    }
  }, [content, editor]);

  const handleLinkClick = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL を入力', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="text-muted-foreground h-[180px] px-3 py-2 text-sm">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col">
      {/* ミニツールバー */}
      <div className="flex items-center gap-0.5 px-1 py-1" role="toolbar" aria-label="テキスト書式">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="太字"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="斜体"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="下線"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={editor.isActive('link')}
          tooltip="リンク"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="箇条書き"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="番号付きリスト"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          tooltip="チェックリスト"
        >
          <CheckSquare className="size-4" />
        </ToolbarButton>
      </div>

      {/* エディター本体 */}
      <div className="h-[180px] overflow-y-auto">
        <EditorContent editor={editor} className="text-sm" />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  tooltip,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <HoverTooltip content={tooltip} side="top">
      <button
        type="button"
        onClick={onClick}
        aria-label={tooltip}
        aria-pressed={isActive}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          isActive ? 'bg-state-selected text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
      </button>
    </HoverTooltip>
  );
}
