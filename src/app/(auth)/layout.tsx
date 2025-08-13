'use client'

import { AuthLayout } from '@/features/auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
