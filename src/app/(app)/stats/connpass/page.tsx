import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Connpass',
}

export default function ConnpassPage() {
  return <Heading>Connpass</Heading>
}
