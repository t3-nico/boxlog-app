'use client'

import React from 'react'
import { CurrentScheduleCard } from './current-schedule-card'

interface CommonBottomSectionsProps {
  collapsed: boolean
}

export function CommonBottomSections({ collapsed }: CommonBottomSectionsProps) {
  return (
    <div className="flex-shrink-0">
      <CurrentScheduleCard collapsed={collapsed} />
    </div>
  )
}