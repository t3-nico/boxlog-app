import dynamic from 'next/dynamic'
import { Heading } from '@/components/heading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar',
}

const Calendar = dynamic(() => import('./calendar-client'), { ssr: false })

export default function CalendarPage() {
  return (
    <>
      <Heading>Calendar</Heading>
      <div className="mt-8">
        <Calendar />
      </div>
    </>
  )
}
