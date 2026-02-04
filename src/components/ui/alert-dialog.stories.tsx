import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangle, Clock, LogOut, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';
import { Input } from './input';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AlertDialogStory() {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [sessionOpen, setSessionOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">AlertDialog</h1>
        <p className="text-muted-foreground mb-8">
          重要なアクションの確認。削除、ログアウト、不可逆操作で使用。Dialogと異なりESCで閉じない。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">削除確認（主要用途）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              不可逆な削除アクション。AlertDialogActionにdestructiveスタイルを適用。
            </p>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 size-4" />
                  タグを削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>タグを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    このタグを削除すると、関連する全てのプランと記録からタグが解除されます。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive-hover">
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">セッションタイムアウト</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              セッション期限切れ警告。中央配置のアイコン、カウントダウン表示。
            </p>
            <AlertDialog open={sessionOpen} onOpenChange={setSessionOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">セッション警告を表示</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="bg-warning/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Clock className="text-warning h-6 w-6" />
                  </div>
                  <AlertDialogTitle className="text-center">
                    セッションがまもなく期限切れになります
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    セキュリティのため、まもなくログアウトされます。
                    <span className="text-foreground mt-2 block text-2xl font-bold">4:59</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                  <AlertDialogCancel className="gap-2">
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </AlertDialogCancel>
                  <AlertDialogAction>セッションを延長</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">アカウント削除（GDPR対応）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              確認テキスト入力を含む高リスク操作。AlertDialogDescription内にフォーム。
            </p>
            <AlertDialog open={accountOpen} onOpenChange={setAccountOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">アカウント削除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    アカウントを削除しますか？
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>
                        この操作は30日後に完了します。その間にログインすると削除をキャンセルできます。
                      </p>
                      <div className="bg-muted rounded-2xl p-4">
                        <h4 className="text-foreground mb-2 text-sm font-bold">猶予期間について</h4>
                        <p className="text-xs">
                          30日間の猶予期間中はデータが保持されます。期間終了後、全てのデータが完全に削除されます。
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-foreground text-sm font-normal">
                          確認のため「DELETE」と入力してください
                        </label>
                        <Input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="DELETE"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmText('')}>
                    キャンセル
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={confirmText !== 'DELETE'}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
                  >
                    アカウントを削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Dialog vs AlertDialog</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>Dialog</strong>:
                  一般的なモーダル。ESCで閉じる、オーバーレイクリックで閉じる
                </li>
                <li>
                  <strong>AlertDialog</strong>:
                  重要な確認。ESCで閉じない、オーバーレイクリックで閉じない、明示的なアクション必須
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>AlertDialog - ルートコンテナ（状態管理）</li>
                <li>AlertDialogTrigger - 開くトリガー（asChild対応）</li>
                <li>AlertDialogContent - コンテンツ（中央配置、rounded-2xl）</li>
                <li>AlertDialogHeader - ヘッダー（Title + Description）</li>
                <li>AlertDialogTitle - タイトル（text-lg font-bold）</li>
                <li>AlertDialogDescription - 説明（asChildでカスタムコンテンツ可）</li>
                <li>AlertDialogFooter - フッター（Cancel + Action）</li>
                <li>AlertDialogCancel - キャンセルボタン（variant: outline）</li>
                <li>AlertDialogAction - 実行ボタン（variant: default）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>AccountDeletionDialog - アカウント削除（GDPR対応）</li>
              <li>SessionTimeoutDialog - セッションタイムアウト警告</li>
              <li>TagMerge確認 - タグマージの確認</li>
              <li>BulkDelete確認 - 一括削除の確認</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
