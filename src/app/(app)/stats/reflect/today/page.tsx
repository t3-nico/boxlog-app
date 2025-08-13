import { Heading } from '@/components/custom'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Today',
}

export default function ReflectTodayPage() {
  return <Heading>Today</Heading>
}
