'use client'

import { Mail, PlusCircle, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Quick Create Section */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex min-w-8 flex-1 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium duration-200 ease-linear"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Quick Create</span>
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="h-8 w-8 shrink-0" variant="outline">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Inbox</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inbox</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col">
        <div className="text-muted-foreground px-2 py-2 text-xs font-semibold">Views</div>
        <div className="flex flex-col">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.url}
              className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
