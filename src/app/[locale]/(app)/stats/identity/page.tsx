import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Identity',
}

const IdentityPage = () => {
  return <Heading>Identity</Heading>
}

export default IdentityPage
