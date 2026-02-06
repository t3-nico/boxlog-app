import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SimpleDescriptionEditor } from '@/components/ui/simple-description-editor';

const meta = {
  title: 'Components/Editor',
  component: SimpleDescriptionEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
    autoFocus: {
      control: 'boolean',
      description: '自動フォーカス',
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-card border-border w-[400px] rounded-xl border p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SimpleDescriptionEditor>;

export default meta;
type Story = StoryObj;

function EditorWithState({
  initialContent,
  placeholder = '説明を追加...',
  autoFocus = false,
}: {
  initialContent?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState(initialContent || '');

  return (
    <SimpleDescriptionEditor
      content={content}
      onChange={setContent}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  );
}

/** 基本形。空の状態からリッチテキスト入力。実使用: NoteIconButton（content, onChange, placeholder, autoFocus 全て使用） */
export const Default: Story = {
  render: () => <EditorWithState />,
};

/** 初期コンテンツあり（太字・斜体・リスト）。 */
export const WithContent: Story = {
  render: () => (
    <EditorWithState initialContent="<p>これは<strong>太字</strong>と<em>斜体</em>のテスト</p><ul><li>リスト項目1</li><li>リスト項目2</li></ul>" />
  ),
};

/** autoFocus=true。ポップオーバー展開時に自動フォーカス。 */
export const AutoFocus: Story = {
  render: () => <EditorWithState placeholder="自動フォーカス" autoFocus />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <EditorWithState />
      <EditorWithState initialContent="<p>これは<strong>太字</strong>と<em>斜体</em>のテスト</p><ul><li>リスト項目1</li><li>リスト項目2</li></ul>" />
      <EditorWithState placeholder="自動フォーカス" autoFocus />
    </div>
  ),
};
