import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Purpose',
}

export default function PurposePage() {
  return <Heading>Purpose</Heading>
}
