"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <div className="flex items-center justify-between rounded-md px-3 py-2">
        <span className="text-sm font-medium">Theme</span>
        <SimpleThemeToggle />
      </div>
      {items.map((item) => (
        <a
          key={item.title}
          href={item.url}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </a>
      ))}
    </div>
  )
}
