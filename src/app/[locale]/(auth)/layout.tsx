'use client'

import { AuthLayout } from '@/features/auth'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>
}

export default RootLayout
