'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Logo } from '@/app/logo'
import { Field, Heading, Label, Text } from '@/components/custom'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { useAuthContext } from '@/features/auth'

const ResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuthContext()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get access tokens from URL parameters
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  useEffect(() => {
    // Redirect to auth page if tokens are missing
    if (!accessToken || !refreshToken) {
      router.push('/auth')
    }
  }, [accessToken, refreshToken, router])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      // 時間定数比較でタイミング攻撃を防ぐ
      if (password.length !== confirmPassword.length || password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      try {
        const { error } = await updatePassword(password)

        if (error) {
          setError(error.message)
        } else {
          setSuccess(true)
          // Redirect to main page after 3 seconds
          setTimeout(() => {
            router.push('/calendar')
          }, 3000)
        }
      } catch (err) {
        setError('An error occurred while updating the password')
      } finally {
        setLoading(false)
      }
    },
    [password, confirmPassword, updatePassword, router]
  )

  const handleBackToLogin = useCallback(() => {
    router.push('/auth')
  }, [router])

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <Heading level={2} className="text-green-600 dark:text-green-500">
          Password Updated
        </Heading>
        <Text>Your password has been updated.</Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-neutral-900 dark:text-neutral-100 forced-colors:text-[CanvasText]" />
      <Heading>Set a new password</Heading>
      <Field>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" type="password" value={password} onChange={handlePasswordChange} required minLength={6} />
      </Field>
      <Field>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          minLength={6}
        />
      </Field>
      {error != null ? <Text className="text-red-600 dark:text-red-500">{error}</Text> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
      <button
        type="button"
        onClick={handleBackToLogin}
        className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm"
      >
        Back to login
      </button>
    </form>
  )
}

export default ResetPassword
