'use client'

import { Toaster } from '@/components/ui/sonner'
import { AuthLayout } from '@/features/auth'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLayout>{children}</AuthLayout>
      <Toaster />
    </>
  )
}

export default RootLayout
