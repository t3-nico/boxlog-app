import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Principles',
}

const PrinciplesPage = () => {
  return <Heading>Principles</Heading>
}

export default PrinciplesPage
