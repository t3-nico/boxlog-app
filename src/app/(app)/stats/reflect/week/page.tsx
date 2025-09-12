import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Week',
}

export default function ReflectWeekPage() {
  return <Heading>Week</Heading>
}
