'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DIALOG_PRESET } from '@/constants/ui'
import { createClient } from '@/lib/supabase/client'

interface EmailChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

export function EmailChangeDialog({ open, onOpenChange, currentEmail }: EmailChangeDialogProps) {
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // 1. パスワード確認（現在のメールアドレスで再認証）
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      })

      if (signInError) {
        throw new Error('パスワードが正しくありません')
      }

      // 2. メールアドレス更新（確認メール送信）
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      )

      if (updateError) {
        throw new Error(`メールアドレスの更新に失敗しました: ${updateError.message}`)
      }

      // 成功
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewEmail('')
    setPassword('')
    setError(null)
    setSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={DIALOG_PRESET.form.width}>
        <DialogHeader>
          <DialogTitle>メールアドレスを変更</DialogTitle>
          <DialogDescription>
            {success ? '確認メールを送信しました' : '新しいメールアドレスとパスワードを入力してください'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm">
                <strong>{newEmail}</strong> に確認メールを送信しました。
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                メール内のリンクをクリックして、メールアドレスの変更を完了してください。
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">現在のメールアドレス</Label>
                <Input id="current-email" type="email" value={currentEmail} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">新しいメールアドレス</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード確認</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="現在のパスワードを入力"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '確認中...' : '確認メールを送信'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {success && (
          <DialogFooter>
            <Button onClick={handleClose}>閉じる</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
