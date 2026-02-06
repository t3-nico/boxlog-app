import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

const meta = {
  title: 'Components/CookieConsentBanner',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Cookie同意バナーのレイアウト再現。実コンポーネントは内部状態に依存するためStorybookではモックを使用。 */
export const Default: Story = {
  render: () => (
    <div className="relative min-h-[200px]">
      <div
        className="border-border bg-card absolute inset-x-0 bottom-0 border-t p-4 backdrop-blur-sm sm:p-6"
        role="dialog"
        aria-labelledby="cookie-consent-title"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2 id="cookie-consent-title" className="text-foreground mb-1 text-base font-bold">
                Cookieの使用について
              </h2>
              <p className="text-muted-foreground text-sm">
                当サイトは、サービスの向上と利用状況の分析のためにCookieを使用します。{' '}
                <a href="#" className="text-primary hover:text-primary/80 underline">
                  詳しく見る
                </a>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button variant="ghost" className="w-full sm:w-auto">
                カスタマイズ
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                必須のみ
              </Button>
              <Button className="w-full sm:w-auto">すべて同意</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="relative min-h-[200px]">
        <div
          className="border-border bg-card absolute inset-x-0 bottom-0 border-t p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-labelledby="cookie-consent-title"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h2 id="cookie-consent-title" className="text-foreground mb-1 text-base font-bold">
                  Cookieの使用について
                </h2>
                <p className="text-muted-foreground text-sm">
                  当サイトは、サービスの向上と利用状況の分析のためにCookieを使用します。{' '}
                  <a href="#" className="text-primary hover:text-primary/80 underline">
                    詳しく見る
                  </a>
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Button variant="ghost" className="w-full sm:w-auto">
                  カスタマイズ
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  必須のみ
                </Button>
                <Button className="w-full sm:w-auto">すべて同意</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
