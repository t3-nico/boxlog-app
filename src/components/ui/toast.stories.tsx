import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';

import { Button } from './button';
import { Toaster } from './toast';

const meta = {
  title: 'Components/Toast',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {},
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
// ヘルパー: セクション見出し
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">{children}</p>;
}

// ---------------------------------------------------------------------------
// バリアント別 Story（基本 + 実利用）
// ---------------------------------------------------------------------------

/** Success: 成功トースト */
export const Success: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <Button variant="outline" onClick={() => toast.success('保存しました')}>
          Success
        </Button>
      </div>

      <div>
        <SectionLabel>実利用</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast.success('「朝のルーティン」を作成しました', {
                action: { label: '元に戻す', onClick: () => toast.success('復元しました') },
              })
            }
          >
            プラン作成 + Undo
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success('プランを削除しました', {
                action: { label: '元に戻す', onClick: () => toast.success('復元しました') },
              })
            }
          >
            プラン削除 + Undo
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('ステータスを「完了」に変更しました')}
          >
            ステータス変更
          </Button>
          <Button variant="outline" onClick={() => toast.success('3件を一括更新しました')}>
            一括更新
          </Button>
          <Button variant="outline" onClick={() => toast.success('コピーしました')}>
            コピー
          </Button>
          <Button variant="outline" onClick={() => toast.success('「仕事」を作成しました')}>
            タグ作成
          </Button>
          <Button variant="outline" onClick={() => toast.success('設定を保存しました')}>
            設定保存
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('データのエクスポートが完了しました')}
          >
            エクスポート
          </Button>
          <Button variant="outline" onClick={() => toast.success('ログアウトしました')}>
            ログアウト
          </Button>
          <Button variant="outline" onClick={() => toast.success('プロフィールを更新しました')}>
            プロフィール更新
          </Button>
        </div>
      </div>
    </div>
  ),
};

/** Error: エラートースト */
export const Error: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <Button variant="outline" onClick={() => toast.error('エラーが発生しました')}>
          Error
        </Button>
      </div>

      <div>
        <SectionLabel>実利用</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => toast.error('プランの作成に失敗しました: ネットワークエラー')}
          >
            プラン作成失敗
          </Button>
          <Button variant="outline" onClick={() => toast.error('プランの更新に失敗しました')}>
            プラン更新失敗
          </Button>
          <Button variant="outline" onClick={() => toast.error('タグの作成に失敗しました')}>
            タグ作成失敗
          </Button>
          <Button variant="outline" onClick={() => toast.error('この名前は既に使用されています')}>
            重複名エラー
          </Button>
          <Button variant="outline" onClick={() => toast.error('この時間帯にはドロップできません')}>
            ドロップ不可
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error('保存に失敗しました', {
                description: 'ネットワークエラーが発生しました。もう一度お試しください。',
              })
            }
          >
            設定保存失敗 + description
          </Button>
          <Button variant="outline" onClick={() => toast.error('パスワードが正しくありません')}>
            パスワードエラー
          </Button>
          <Button variant="outline" onClick={() => toast.error('ブラウザの通知が拒否されています')}>
            通知権限拒否
          </Button>
          <Button variant="outline" onClick={() => toast.error('ログアウトに失敗しました')}>
            ログアウト失敗
          </Button>
        </div>
      </div>
    </div>
  ),
};

/** Info: 情報トースト */
export const Info: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <Button variant="outline" onClick={() => toast.info('お知らせがあります')}>
          Info
        </Button>
      </div>

      <div>
        <SectionLabel>実利用</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast.info('予定を削除しました', {
                action: { label: '元に戻す', onClick: () => toast.success('復元しました') },
              })
            }
          >
            Calendar 削除 + Undo
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info('リマインダー', {
                description: '「朝のルーティン」の開始時刻です',
              })
            }
          >
            リアルタイム通知 + description
          </Button>
        </div>
      </div>
    </div>
  ),
};

/** Warning: 警告トースト */
export const Warning: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <Button variant="outline" onClick={() => toast.warning('注意が必要です')}>
          Warning
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">現在アプリ内での実利用なし</p>
    </div>
  ),
};

/** Default: 通常トースト（バリアント指定なし） */
export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <Button variant="outline" onClick={() => toast('これはトーストメッセージです')}>
          Default
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">現在アプリ内での実利用なし</p>
    </div>
  ),
};

/** Loading: ローディング → 成功遷移 */
export const Loading: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <SectionLabel>基本</SectionLabel>
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
      </div>

      <div>
        <SectionLabel>実利用</SectionLabel>
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading('予定を移動中...');
            setTimeout(() => {
              toast.dismiss(id);
              toast.success('予定を移動しました');
            }, 2000);
          }}
        >
          Calendar D&D移動
        </Button>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// パターン別 Story（全バリアント横断）
// ---------------------------------------------------------------------------

/** WithDescription: 説明付きパターン */
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

/** WithAction: アクション付きパターン */
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

/** WithDescriptionAndAction: 説明+アクション複合パターン */
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

/** Promise: Promise統合パターン（現在アプリ内での実利用なし） */
export const PromiseIntegration: Story = {
  name: 'Promise',
  render: () => (
    <div className="space-y-4">
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
      <p className="text-muted-foreground text-xs">現在アプリ内での実利用なし</p>
    </div>
  ),
};
