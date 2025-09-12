import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'All',
}

export default function ReflectAllPage() {
  return <Heading>All</Heading>
}
