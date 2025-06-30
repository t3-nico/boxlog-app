'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/ui/input'
import { Strong, Text, TextLink } from '@/components/text'

export default function ForgotPasswordForm() {
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
        setError(error)
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
      <div className="text-center space-y-6">
        <Heading level={2} className="text-green-600">Email Sent</Heading>
        <Text>A password reset link was sent to {email}.</Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Reset Password</Heading>
      <Text>Enter your registered email address.</Text>
      <Field>
        <Label>Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      {error && <Text className="text-red-600">{error}</Text>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending...' : 'Send reset email'}
      </Button>
      <Text className="text-center">
        <TextLink href="/auth/login">
          <Strong>Back to login</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
