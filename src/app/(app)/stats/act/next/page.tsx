import type { Metadata } from 'next'

import { Heading } from '@/components/custom'

export const metadata: Metadata = {
  title: 'Next',
}

export default function ActNextPage() {
  return <Heading>Next</Heading>
}
