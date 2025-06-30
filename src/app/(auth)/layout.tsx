'use client'

import { AuthLayout } from '@/components/auth-layout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
