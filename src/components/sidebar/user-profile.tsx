'use client'

import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { useAuth } from '@/hooks/use-auth'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import {
  ChevronDown,
  Settings,
  LogOut,
  User,
  CreditCard,
  Shield,
  HelpCircle,
  Lightbulb,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfileProps {
  collapsed?: boolean
}

export function UserProfile({ collapsed = false }: UserProfileProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!user || collapsed) {
    return null
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const userPlan = 'Free' // TODO: Get from user subscription data

  return (
    <div className="px-4">
      <Dropdown>
        <DropdownButton className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 transition-colors duration-150">
          <Avatar
            src={user.user_metadata?.avatar_url}
            className="size-8"
            initials={userDisplayName.charAt(0).toUpperCase()}
          />
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-gray-200 truncate">
              {userDisplayName}
            </div>
            <div className="text-xs text-gray-400">
              {userPlan} Plan
            </div>
          </div>
          <ChevronDown className="size-4 text-gray-400" data-slot="icon" />
        </DropdownButton>
        
        <DropdownMenu className="min-w-64" anchor="bottom start">
          <DropdownItem href="/settings">
            <Settings data-slot="icon" />
            <DropdownLabel>Settings</DropdownLabel>
          </DropdownItem>
          
          <DropdownDivider />
          
          <DropdownItem href="/support">
            <HelpCircle data-slot="icon" />
            <DropdownLabel>Support</DropdownLabel>
          </DropdownItem>
          
          <DropdownDivider />
          
          <DropdownItem onClick={handleSignOut}>
            <LogOut data-slot="icon" />
            <DropdownLabel>Logout</DropdownLabel>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}