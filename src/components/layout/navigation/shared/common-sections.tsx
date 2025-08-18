'use client'

import React from 'react'
import { PlusCircle as PlusCircleIcon } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useAddPopup } from '@/features/calendar/components/event'

interface CommonSidebarSectionsProps {
  collapsed: boolean
}

export function CommonSidebarSections({ collapsed }: CommonSidebarSectionsProps) {
  const { openPopup } = useAddPopup()
  
  if (collapsed) return null

  return (
    <div className="mb-3">
      <Button
        onClick={(e) => {
          e.preventDefault()
          openPopup('event')
        }}
        variant="default"
        className="w-[136px] h-[56px] py-4 px-4 flex items-center gap-2 font-semibold"
      >
        <span className="truncate">Create</span>
        <PlusCircleIcon className="size-5 shrink-0 text-primary-foreground" />
      </Button>
    </div>
  )
}