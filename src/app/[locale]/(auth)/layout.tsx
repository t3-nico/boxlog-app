'use client'

import { Toaster } from '@/components/ui/sonner'
import { AuthLayout } from '@/features/auth'
import { RecaptchaScript } from '@/lib/recaptcha'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <RecaptchaScript />
      <AuthLayout>{children}</AuthLayout>
      <Toaster />
    </>
  )
}

export default RootLayout
