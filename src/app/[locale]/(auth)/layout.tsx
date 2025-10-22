'use client'

import { AuthLayout } from '@/features/auth'
import { RecaptchaProviderWrapper } from '@/lib/recaptcha/provider'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecaptchaProviderWrapper>
      <AuthLayout>{children}</AuthLayout>
    </RecaptchaProviderWrapper>
  )
}

export default RootLayout
