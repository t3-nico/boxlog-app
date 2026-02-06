import type { Meta, StoryObj } from '@storybook/react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

const meta = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function ResizableStory() {
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="border-border h-64 w-full max-w-4xl rounded-lg border">
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

        <div className="border-border h-64 w-full max-w-4xl rounded-lg border">
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

        <div className="border-border h-64 w-full max-w-4xl rounded-lg border">
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

        <div className="border-border h-64 w-full max-w-4xl rounded-lg border">
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
    );
  },
};
