import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Life Vision',
}

const LifeVisionPage = () => {
  return <Heading>Life Vision</Heading>
}

export default LifeVisionPage
