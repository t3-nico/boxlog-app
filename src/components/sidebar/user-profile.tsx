'use client'

import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const { user } = useAuthContext()
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
  const profileIcon = user.user_metadata?.profile_icon
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 transition-colors duration-150 rounded-md">
            {avatarUrl ? (
              <Avatar
                src={avatarUrl}
                className="size-8"
                initials={userDisplayName.charAt(0).toUpperCase()}
              />
            ) : profileIcon ? (
              <div className="size-8 text-2xl flex items-center justify-center">
                {profileIcon}
              </div>
            ) : (
              <Avatar
                src={undefined}
                className="size-8"
                initials={userDisplayName.charAt(0).toUpperCase()}
              />
            )}
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate">
                {userDisplayName}
              </div>
              <div className="text-xs text-gray-400">
                {userPlan} Plan
              </div>
            </div>
            <ChevronDown className="size-4 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="min-w-64" align="start">
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => router.push('/support')}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Support
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}