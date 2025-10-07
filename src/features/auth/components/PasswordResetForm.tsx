'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { useAuthContext } from '../contexts/AuthContext'

export const PasswordResetForm = ({ className, ...props }: React.ComponentProps<'form'>) => {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An error occurred while resetting the password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Email Sent</h1>
          <p className="text-muted-foreground text-balance text-sm">A password reset link was sent to {email}.</p>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/login" className="underline underline-offset-4">
            Back to Log in
          </a>
        </div>
      </div>
    )
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground text-balance text-sm">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error ? <div className="text-red-600 dark:text-red-400 text-center text-sm">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending reset email...' : t('auth.passwordResetForm.sendResetEmail')}
        </Button>
      </div>
      <div className="text-center text-sm">
        Remember your password?{' '}
        <a href="/auth/login" className="underline underline-offset-4">
          Back to Log in
        </a>
      </div>
    </form>
  )
}
