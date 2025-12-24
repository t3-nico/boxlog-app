'use client'

import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import type { TranslatedString } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: TranslatedString
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<'div'>) {
  const pathname = usePathname()

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.url || pathname?.startsWith(item.url + '/')
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-state-active text-state-active-foreground' : 'hover:bg-state-hover'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
