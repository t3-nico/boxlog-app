import { redirect } from 'next/navigation'

export default function CalendarPage() {
  const [today] = new Date().toISOString().split('T') // YYYY-MM-DD
  redirect(`/calendar/day?date=${today}`)
}
