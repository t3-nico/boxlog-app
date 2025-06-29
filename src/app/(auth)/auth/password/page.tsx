'use client'

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot password',
}

export default function PasswordResetPage() {
  return <ForgotPasswordForm />
}
