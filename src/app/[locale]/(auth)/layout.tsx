'use client'

import { Toaster } from '@/components/ui/sonner'
import { AuthLayout } from '@/features/auth'
import { RecaptchaProviderWrapper } from '@/lib/recaptcha/provider'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecaptchaProviderWrapper>
      <AuthLayout>{children}</AuthLayout>
      <Toaster />
    </RecaptchaProviderWrapper>
  )
}

export default RootLayout
