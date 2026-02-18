import type { Meta, StoryObj } from '@storybook/react-vite';

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
                About Cookies
              </h2>
              <p className="text-muted-foreground text-sm">
                We use cookies and similar technologies to improve service quality and analyze
                usage.{' '}
                <a href="#" className="text-primary hover:text-primary/80 underline">
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Essential only
              </Button>
              <Button className="w-full sm:w-auto">Accept all</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
