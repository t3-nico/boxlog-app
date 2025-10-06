import type { Metadata } from 'next'

import { Heading } from '@/components/app'

export const metadata: Metadata = {
  title: 'AntiValues',
}

const AntiValuesPage = () => {
  return <Heading>AntiValues</Heading>
}

export default AntiValuesPage
