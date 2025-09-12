import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Identity',
}

export default function IdentityPage() {
  return <Heading>Identity</Heading>
}
