import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';

import { Button } from './button';
import { Toaster } from './sonner';

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 個別バリアント Story
// ---------------------------------------------------------------------------

/** Default: 通常トースト */
export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast('これはトーストメッセージです')}>
      Default トースト
    </Button>
  ),
};

/** Success: 成功トースト */
export const Success: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.success('保存しました')}>
      Success トースト
    </Button>
  ),
};

/** Error: エラートースト */
export const Error: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.error('エラーが発生しました')}>
      Error トースト
    </Button>
  ),
};

/** Warning: 警告トースト */
export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning('注意が必要です')}>
      Warning トースト
    </Button>
  ),
};

/** Info: 情報トースト */
export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info('お知らせがあります')}>
      Info トースト
    </Button>
  ),
};

/** Loading: ローディング → 成功遷移 */
export const Loading: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const toastId = toast.loading('処理中...');
        setTimeout(() => {
          toast.success('完了しました', { id: toastId });
        }, 2000);
      }}
    >
      Loading → Success
    </Button>
  ),
};

/** WithDescription: 全バリアントの説明付きパターン */
export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast('タイトル', { description: '詳細な説明がここに表示されます。' })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('保存しました', { description: 'すべての変更が反映されました。' })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('保存に失敗', { description: 'ネットワークエラーが発生しました。' })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('容量が少ない', {
            description: '残り10%です。不要なファイルを削除してください。',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('新機能', { description: 'タイムボクシング機能が追加されました。' })
        }
      >
        Info
      </Button>
    </div>
  ),
};

/** WithAction: 全バリアントのアクション付きパターン */
export const WithAction: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast('アイテムを削除しました', {
            action: { label: '元に戻す', onClick: () => toast.success('復元しました') },
          })
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('エクスポート完了', {
            action: { label: 'ダウンロード', onClick: () => toast('ダウンロード開始') },
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('同期に失敗', {
            action: { label: 'リトライ', onClick: () => toast.loading('再試行中...') },
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('セッション期限切れ間近', {
            action: { label: '延長', onClick: () => toast.success('延長しました') },
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('アップデート利用可能', {
            action: { label: '更新', onClick: () => toast.loading('更新中...') },
          })
        }
      >
        Info
      </Button>
    </div>
  ),
};

/** WithDescriptionAndAction: 全バリアントの説明+アクション複合パターン */
export const WithDescriptionAndAction: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast('アイテムを削除しました', {
            description: 'ゴミ箱に移動されました。30日後に完全削除されます。',
            action: { label: '元に戻す', onClick: () => toast.success('復元しました') },
          })
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('エクスポート完了', {
            description: 'CSVファイル（1,234件）が生成されました。',
            action: { label: 'ダウンロード', onClick: () => toast('ダウンロード開始') },
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('同期に失敗しました', {
            description: 'サーバーとの接続がタイムアウトしました。',
            action: { label: 'リトライ', onClick: () => toast.loading('再試行中...') },
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('セッション期限切れ間近', {
            description: 'あと5分で自動ログアウトされます。',
            action: { label: '延長', onClick: () => toast.success('延長しました') },
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('アップデート利用可能', {
            description: 'v2.0.0がリリースされました。新機能が追加されています。',
            action: { label: '更新', onClick: () => toast.loading('更新中...') },
          })
        }
      >
        Info
      </Button>
    </div>
  ),
};

/** PromiseIntegration: Promise統合パターン */
export const PromiseIntegration: Story = {
  name: 'Promise',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => {
          const promise = new Promise((resolve) => setTimeout(resolve, 2000));
          toast.promise(promise, {
            loading: '保存中...',
            success: '保存しました',
            error: 'エラーが発生しました',
          });
        }}
      >
        Promise（成功）
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const promise = new Promise((_resolve, reject) => setTimeout(reject, 2000));
          toast.promise(promise, {
            loading: '送信中...',
            success: '送信しました',
            error: '送信に失敗しました',
          });
        }}
      >
        Promise（失敗）
      </Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// AllPatterns: 全バリアント × 全パターンのカタログ
// ---------------------------------------------------------------------------

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="bg-background text-foreground min-h-screen w-full p-8">
        <h1 className="mb-2 text-2xl font-bold">Sonner (Toast)</h1>
        <p className="text-muted-foreground mb-8">トースト通知 — 全バリアント × 全パターン</p>

        <div className="space-y-8">
          {/* バリアント一覧 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">バリアント</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast('通常メッセージ')}>
                Default
              </Button>
              <Button variant="outline" onClick={() => toast.success('成功しました')}>
                Success
              </Button>
              <Button variant="outline" onClick={() => toast.error('エラーが発生')}>
                Error
              </Button>
              <Button variant="outline" onClick={() => toast.warning('警告')}>
                Warning
              </Button>
              <Button variant="outline" onClick={() => toast.info('お知らせ')}>
                Info
              </Button>
            </div>
          </section>

          {/* 説明付き（全バリアント） */}
          <section>
            <h2 className="mb-4 text-lg font-bold">説明付き（全バリアント）</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  toast('タイトル', { description: '詳細な説明がここに表示されます。' })
                }
              >
                Default
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success('保存しました', {
                    description: 'すべての変更が反映されました。',
                  })
                }
              >
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error('保存に失敗', {
                    description: 'ネットワークエラーが発生しました。',
                  })
                }
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning('容量が少ない', {
                    description: '残り10%です。不要なファイルを削除してください。',
                  })
                }
              >
                Warning
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info('新機能', {
                    description: 'タイムボクシング機能が追加されました。',
                  })
                }
              >
                Info
              </Button>
            </div>
          </section>

          {/* アクション付き（全バリアント） */}
          <section>
            <h2 className="mb-4 text-lg font-bold">アクション付き（全バリアント）</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  toast('アイテムを削除しました', {
                    action: {
                      label: '元に戻す',
                      onClick: () => toast.success('復元しました'),
                    },
                  })
                }
              >
                Default
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success('エクスポート完了', {
                    action: {
                      label: 'ダウンロード',
                      onClick: () => toast('ダウンロード開始'),
                    },
                  })
                }
              >
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error('同期に失敗', {
                    action: {
                      label: 'リトライ',
                      onClick: () => toast.loading('再試行中...'),
                    },
                  })
                }
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning('セッション期限切れ間近', {
                    action: {
                      label: '延長',
                      onClick: () => toast.success('延長しました'),
                    },
                  })
                }
              >
                Warning
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info('アップデート利用可能', {
                    action: {
                      label: '更新',
                      onClick: () => toast.loading('更新中...'),
                    },
                  })
                }
              >
                Info
              </Button>
            </div>
          </section>

          {/* 説明+アクション（全バリアント） */}
          <section>
            <h2 className="mb-4 text-lg font-bold">説明+アクション（全バリアント）</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  toast('アイテムを削除しました', {
                    description: 'ゴミ箱に移動されました。30日後に完全削除されます。',
                    action: {
                      label: '元に戻す',
                      onClick: () => toast.success('復元しました'),
                    },
                  })
                }
              >
                Default
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success('エクスポート完了', {
                    description: 'CSVファイル（1,234件）が生成されました。',
                    action: {
                      label: 'ダウンロード',
                      onClick: () => toast('ダウンロード開始'),
                    },
                  })
                }
              >
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error('同期に失敗しました', {
                    description: 'サーバーとの接続がタイムアウトしました。',
                    action: {
                      label: 'リトライ',
                      onClick: () => toast.loading('再試行中...'),
                    },
                  })
                }
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning('セッション期限切れ間近', {
                    description: 'あと5分で自動ログアウトされます。',
                    action: {
                      label: '延長',
                      onClick: () => toast.success('延長しました'),
                    },
                  })
                }
              >
                Warning
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info('アップデート利用可能', {
                    description: 'v2.0.0がリリースされました。新機能が追加されています。',
                    action: {
                      label: '更新',
                      onClick: () => toast.loading('更新中...'),
                    },
                  })
                }
              >
                Info
              </Button>
            </div>
          </section>

          {/* ローディング → 完了 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">ローディング → 完了</h2>
            <Button
              variant="outline"
              onClick={() => {
                const toastId = toast.loading('処理中...');
                setTimeout(() => {
                  toast.success('完了しました', { id: toastId });
                }, 2000);
              }}
            >
              Loading → Success
            </Button>
          </section>

          {/* Promise統合 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">Promise統合</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                  toast.promise(promise, {
                    loading: '保存中...',
                    success: '保存しました',
                    error: 'エラーが発生しました',
                  });
                }}
              >
                Promise（成功）
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const promise = new Promise((_resolve, reject) => setTimeout(reject, 2000));
                  toast.promise(promise, {
                    loading: '送信中...',
                    success: '送信しました',
                    error: '送信に失敗しました',
                  });
                }}
              >
                Promise（失敗）
              </Button>
            </div>
          </section>

          {/* カラーパレット */}
          <section>
            <h2 className="mb-4 text-lg font-bold">カラーパレット</h2>
            <div className="grid gap-2">
              <div className="flex items-center gap-4">
                <div className="bg-card border-border h-8 w-8 rounded border" />
                <span className="text-sm">Default: bg-card / border-border</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-card border-success h-8 w-8 rounded border" />
                <span className="text-sm">Success: bg-card / border-success</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-card border-destructive h-8 w-8 rounded border" />
                <span className="text-sm">Error: bg-card / border-destructive</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-card border-warning h-8 w-8 rounded border" />
                <span className="text-sm">Warning: bg-card / border-warning</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-card border-info h-8 w-8 rounded border" />
                <span className="text-sm">Info: bg-card / border-info</span>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">使用方法</h2>
            <pre className="bg-container overflow-x-auto rounded-lg p-4 text-sm">
              {`import { toast } from 'sonner'

// バリアント
toast('メッセージ')
toast.success('成功')
toast.error('エラー')
toast.warning('警告')
toast.info('情報')

// 説明付き
toast.success('タイトル', { description: '説明文' })

// アクション付き
toast('削除しました', {
  action: { label: '元に戻す', onClick: () => {} },
})

// 説明+アクション
toast.error('同期に失敗', {
  description: 'タイムアウトしました。',
  action: { label: 'リトライ', onClick: () => {} },
})

// Promise統合
toast.promise(asyncFn(), {
  loading: '処理中...',
  success: '完了',
  error: 'エラー',
})`}
            </pre>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
