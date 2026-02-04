import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SimpleDescriptionEditor } from '@/components/common/SimpleDescriptionEditor';

const meta = {
  title: 'Components/Editor',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="bg-card border-border w-[400px] rounded-xl border p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

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
    <div className="space-y-4">
      <SimpleDescriptionEditor
        content={content}
        onChange={setContent}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <div className="border-border border-t pt-4">
        <p className="text-muted-foreground mb-2 text-xs">出力HTML:</p>
        <pre className="bg-container max-h-32 overflow-auto rounded-lg p-2 text-xs">
          {content || '(empty)'}
        </pre>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <EditorWithState />,
};

export const WithContent: Story = {
  render: () => (
    <EditorWithState initialContent="<p>これは<strong>太字</strong>と<em>斜体</em>のテスト</p><ul><li>リスト項目1</li><li>リスト項目2</li></ul>" />
  ),
};

export const WithTaskList: Story = {
  render: () => (
    <EditorWithState initialContent='<ul data-type="taskList"><li data-type="taskItem" data-checked="true">完了したタスク</li><li data-type="taskItem" data-checked="false">未完了のタスク</li></ul>' />
  ),
};

export const AutoFocus: Story = {
  render: () => <EditorWithState placeholder="自動フォーカス" autoFocus />,
};

export const InPopover: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        ポップオーバー内での使用を想定した高さ180pxのエディター
      </p>
      <div className="bg-card border-border rounded-lg border">
        <EditorWithState placeholder="メモを入力..." />
      </div>
    </div>
  ),
};
