'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { useAuthContext } from '@/features/auth'
import * as Headless from '@headlessui/react'
import {
  LogOut as ArrowRightStartOnRectangleIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const { user, signOut } = useAuthContext()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Headless.Menu as="div" className="relative">
      <Headless.MenuButton className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors group">
        <div className="relative">
          {user?.user_metadata?.avatar_url ? (
            <Avatar 
              src={user.user_metadata.avatar_url} 
              className="w-8 h-8 border border-gray-300 dark:border-gray-600" 
            />
          ) : user?.user_metadata?.profile_icon ? (
            <div className="w-8 h-8 text-sm flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-accent">
              {user.user_metadata.profile_icon}
            </div>
          ) : (
            <Avatar 
              src={undefined}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600"
              initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            />
          )}
          
          {/* Online Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
        </div>
      </Headless.MenuButton>

      <Headless.MenuItems className="absolute left-full bottom-0 ml-2 w-64 origin-bottom-left rounded-xl bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 p-2 z-50">
        {/* User Info */}
        <div className="px-3 py-2 border-b border-zinc-950/10 dark:border-white/10 mb-1">
          <div className="font-medium text-zinc-950 dark:text-white">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </div>
        </div>

        <Headless.MenuItem>
          {({ focus }) => (
            <button
              onClick={() => router.push('/settings')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <Cog8ToothIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Settings</span>
            </button>
          )}
        </Headless.MenuItem>

        <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <ShieldCheckIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Privacy policy</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <LightBulbIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Share feedback</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <QuestionMarkCircleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Support</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <SparklesIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Changelog</span>
            </a>
          )}
        </Headless.MenuItem>

        <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />

        <Headless.MenuItem>
          {({ focus }) => (
            <button
              onClick={handleSignOut}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
              )}
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-950 dark:text-white">Logout</span>
            </button>
          )}
        </Headless.MenuItem>
      </Headless.MenuItems>
    </Headless.Menu>
  )
}