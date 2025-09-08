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
import { componentRadius, animations, spacing, icon } from '@/config/theme'

const { md, lg } = icon.size
import { border, background, text, semantic } from '@/config/theme/colors'

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
      <Headless.MenuButton className={cn(
        'w-10 h-10 flex items-center justify-center hover:bg-accent group',
        componentRadius.button.md,
        animations.transition.fast
      )}>
        <div className="relative">
          {user?.user_metadata?.avatar_url ? (
            <Avatar 
              src={user.user_metadata.avatar_url} 
              className={cn(
                lg, 'border',
                border.universal,
                componentRadius.media.avatar
              )}
            />
          ) : user?.user_metadata?.profile_icon ? (
            <div className={cn(
              lg, 'text-sm flex items-center justify-center bg-accent border',
              border.universal,
              componentRadius.media.avatar
            )}>
              {user.user_metadata.profile_icon}
            </div>
          ) : (
            <Avatar 
              src={undefined}
              className={cn(
                lg, 'border',
                border.universal,
                componentRadius.media.avatar
              )}
              initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            />
          )}
          
          {/* Online Status Indicator */}
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2',
            semantic.success.DEFAULT,
            background.base,
            componentRadius.badge.status
          )}></div>
        </div>
        
        {/* Tooltip */}
        <div className={cn(
          'absolute left-full ml-2 px-2 py-1',
          'bg-popover text-popover-foreground text-xs shadow-lg',
          'opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50',
          componentRadius.input.text,
          animations.transition.fast
        )}>
          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
        </div>
      </Headless.MenuButton>

      <Headless.MenuItems className={cn(
        'absolute left-0 top-full mt-2 w-64 origin-top-left',
        'backdrop-blur-xl shadow-lg z-[9999]',
        background.surface,
        border.subtle,
        'ring-1',
        componentRadius.modal.container,
        spacing.space[2] // p-2
      )}>
        {/* User Info */}
        <div className={cn(
          'px-3 py-2 border-b',
          border.subtle,
          spacing.patterns.form.label // mb-1
        )}>
          <div className={cn('font-medium', text.primary)}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div className={cn('text-sm', text.muted)}>
            {user?.email}
          </div>
        </div>

        <Headless.MenuItem>
          {({ focus }) => (
            <button
              onClick={() => router.push('/settings')}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <Cog8ToothIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Settings</span>
            </button>
          )}
        </Headless.MenuItem>

        <div className={cn('my-1 h-px', border.subtle)} />

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <ShieldCheckIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Privacy policy</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <LightBulbIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Share feedback</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <QuestionMarkCircleIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Support</span>
            </a>
          )}
        </Headless.MenuItem>

        <Headless.MenuItem>
          {({ focus }) => (
            <a
              href="#"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <SparklesIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Changelog</span>
            </a>
          )}
        </Headless.MenuItem>

        <div className={cn('my-1 h-px', border.subtle)} />

        <Headless.MenuItem>
          {({ focus }) => (
            <button
              onClick={handleSignOut}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium',
                componentRadius.navigation.menu,
                animations.transition.fast,
                focus ? background.hover : ''
              )}
            >
              <ArrowRightStartOnRectangleIcon className={cn(md, text.muted)} />
              <span className={text.primary}>Logout</span>
            </button>
          )}
        </Headless.MenuItem>
      </Headless.MenuItems>
    </Headless.Menu>
  )
}