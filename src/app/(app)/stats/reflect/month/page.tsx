import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Month',
}

export default function ReflectMonthPage() {
  return <Heading>Month</Heading>
}
