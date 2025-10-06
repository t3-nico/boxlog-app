import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Purpose',
}

const PurposePage = () => {
  return <Heading>Purpose</Heading>
}

export default PurposePage
