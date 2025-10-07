'use client'

import React from 'react'

import Link from 'next/link'

import { LucideIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface AppBarItemProps {
  id: string
  label: string
  icon: LucideIcon
  href: string
  isActive: boolean
  onItemClick?: () => void
}

export const AppBarItem: React.FC<AppBarItemProps> = ({ label, icon: Icon, href, isActive, onItemClick }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            onClick={onItemClick}
            className={cn(
              'relative flex h-14 w-14 flex-col items-center justify-center',
              'rounded-lg',
              'transition-all duration-200',
              'group',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Gmail-like highlight effect
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : [
                    'text-muted-foreground',
                    'hover:bg-accent/80 hover:text-accent-foreground',
                    'hover:shadow-sm',
                    'before:absolute before:inset-0 before:rounded-lg',
                    'before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent',
                    'before:opacity-0 hover:before:opacity-100',
                    'before:transition-opacity before:duration-300',
                  ]
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="relative z-10 mb-1 h-5 w-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <span className="relative z-10 text-[10px] font-medium leading-none">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
