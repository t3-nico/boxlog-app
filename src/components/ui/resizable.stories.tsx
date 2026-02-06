import type { Meta, StoryObj } from '@storybook/react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

const meta = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function ResizableStory() {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Resizable</h1>
        <p className="text-muted-foreground mb-8">ドラッグでパネルサイズを調整可能なレイアウト。</p>

        <div className="grid max-w-4xl gap-8">
          <div>
            <h2 className="mb-2 text-lg font-bold">水平分割（サイドバー + コンテンツ）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              デスクトップレイアウトでサイドバーのリサイズに使用。
            </p>
            <div className="border-border h-64 rounded-lg border">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                  <div className="bg-surface-container flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Sidebar (25%)</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                  <div className="bg-background flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Main Content (75%)</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">ハンドル付き</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              withHandle propでグリップアイコンを表示。視覚的にリサイズ可能であることを示す。
            </p>
            <div className="border-border h-64 rounded-lg border">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <div className="bg-surface-container flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Left Panel</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <div className="bg-background flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Right Panel</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">垂直分割</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              orientation=&quot;vertical&quot; で上下分割。
            </p>
            <div className="border-border h-64 rounded-lg border">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="bg-surface-container flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Top Panel</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={60}>
                  <div className="bg-background flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Bottom Panel</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">3パネル構成</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              複数パネルを組み合わせ。サイドバー + コンテンツ + インスペクター。
            </p>
            <div className="border-border h-64 rounded-lg border">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="bg-surface-container flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Sidebar</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={55}>
                  <div className="bg-background flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Content</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                  <div className="bg-surface-container flex h-full items-center justify-center p-4">
                    <span className="text-muted-foreground text-sm">Inspector</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>ResizablePanelGroup - ルート（orientation: horizontal/vertical）</li>
                <li>ResizablePanel - パネル（defaultSize, minSize, maxSize）</li>
                <li>ResizableHandle - リサイズハンドル（withHandle: グリップ表示）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Props</h2>
            <div className="bg-container overflow-x-auto rounded-lg p-4">
              <table className="text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="pr-4 text-left">Prop</th>
                    <th className="pr-4 text-left">Type</th>
                    <th className="text-left">説明</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="pr-4 font-mono">orientation</td>
                    <td className="pr-4">horizontal | vertical</td>
                    <td>分割方向</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-mono">defaultSize</td>
                    <td className="pr-4">number</td>
                    <td>初期サイズ（%）</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-mono">minSize</td>
                    <td className="pr-4">number</td>
                    <td>最小サイズ（%）</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-mono">maxSize</td>
                    <td className="pr-4">number</td>
                    <td>最大サイズ（%）</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-mono">withHandle</td>
                    <td className="pr-4">boolean</td>
                    <td>グリップアイコン表示</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>desktop-layout - サイドバーリサイズ</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
