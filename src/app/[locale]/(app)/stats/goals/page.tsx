import type { Metadata } from 'next'

import { Heading } from '@/components/custom'


export const metadata: Metadata = {
  title: 'Goals',
}

const GoalsPage = () => {
  return <Heading>Goals</Heading>
}

export default GoalsPage
