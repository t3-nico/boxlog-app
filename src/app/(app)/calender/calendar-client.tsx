'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/index.css'
import '@fullcalendar/daygrid/index.css'
import '@fullcalendar/timegrid/index.css'

export default function CalendarClient() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,twoWeek,dayGridMonth',
      }}
      views={{
        twoWeek: {
          type: 'timeGrid',
          duration: { weeks: 2 },
          buttonText: '2 week',
        },
      }}
      height="auto"
    />
  )
}
