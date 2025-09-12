import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Goals',
}

export default function GoalsPage() {
  return <Heading>Goals</Heading>
}
