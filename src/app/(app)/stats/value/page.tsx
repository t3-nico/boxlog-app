import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Value',
}

export default function ValuePage() {
  return <Heading>Value</Heading>
}
