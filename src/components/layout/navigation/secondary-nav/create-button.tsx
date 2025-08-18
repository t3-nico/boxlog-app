'use client'

import React from 'react'
import { Button } from '@/components/shadcn-ui/button'
import { PlusCircle as PlusCircleIcon } from 'lucide-react'
import { useAddPopup } from '@/features/calendar/components/event'
import { SidebarSection } from '../shared'

export function CreateButton() {
  const { openPopup } = useAddPopup()

  return (
    <div className="flex-shrink-0 mb-6">
      <SidebarSection>
        <div className="relative">
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
      </SidebarSection>
    </div>
  )
}