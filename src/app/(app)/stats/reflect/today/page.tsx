import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Today',
}

export default function ReflectTodayPage() {
  return <Heading>Today</Heading>
}
