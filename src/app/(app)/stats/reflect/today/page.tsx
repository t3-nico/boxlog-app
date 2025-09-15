import type { Metadata } from 'next'

import { Heading } from '@/components/custom'


export const metadata: Metadata = {
  title: 'Today',
}

const ReflectTodayPage = () => {
  return <Heading>Today</Heading>
}

export default ReflectTodayPage
