import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Today',
}

const ReflectTodayPage = () => {
  return <Heading>Today</Heading>
}

export default ReflectTodayPage
