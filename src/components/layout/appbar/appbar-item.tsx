'use client'

import React from 'react'

import Link from 'next/link'

import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AppBarItemProps {
  id: string
  label: string
  icon: LucideIcon
  href: string
  isActive: boolean
}

export const AppBarItem: React.FC<AppBarItemProps> = ({ label, icon: Icon, href, isActive }) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-14 w-14 flex-col items-center justify-center rounded-lg transition-all duration-150 group',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="mb-1 h-5 w-5" />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  )
}
