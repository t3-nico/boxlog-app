import type { Metadata } from 'next'

import { Heading } from '@/components/app'



export const metadata: Metadata = {
  title: 'Value',
}

const ValuePage = () => {
  return <Heading>Value</Heading>
}

export default ValuePage
