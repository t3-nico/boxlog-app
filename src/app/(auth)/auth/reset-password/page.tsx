'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'

export default function ResetPassword() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
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
        setError(error)
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
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <Heading level={2} className="text-green-600">Password Updated</Heading>
        <Text>Your password has been updated.</Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Set a new password</Heading>
      <Field>
        <Label>New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </Field>
      <Field>
        <Label>Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </Field>
      {error && <Text className="text-red-600">{error}</Text>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
      <button type="button" onClick={() => router.push('/auth')} className="text-blue-600 hover:text-blue-700 text-sm">
        Back to login
      </button>
    </form>
  )
}
