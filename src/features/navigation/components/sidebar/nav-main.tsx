"use client"

import { PlusCircle, Mail, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

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
          className="flex min-w-8 flex-1 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground duration-200 ease-linear hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Quick Create</span>
        </button>
        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          variant="outline"
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only">Inbox</span>
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col">
        <div className="px-2 py-2 text-xs font-semibold text-muted-foreground">
          Views
        </div>
        <div className="flex flex-col">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.url}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent"
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
