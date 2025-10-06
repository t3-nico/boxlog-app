import type { Metadata } from 'next'

import { Heading } from '@/components/app'


export const metadata: Metadata = {
  title: 'Month',
}

const ReflectMonthPage = () => {
  return <Heading>Month</Heading>
}

export default ReflectMonthPage
