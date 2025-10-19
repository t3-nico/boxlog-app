'use client'

import { Bell, ChevronDown, CreditCard, HelpCircle, LogOut, Settings, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/features/i18n/lib/hooks'
import { createClient } from '@/lib/supabase/client'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // URLから locale を抽出
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t, locale } = useI18n(localeFromPath)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent data-[state=open]:bg-accent flex w-fit items-center gap-2 rounded-md px-2 py-1 text-left text-sm outline-hidden"
        >
          <Avatar className="h-6 w-6 rounded-lg">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="max-w-[80px] truncate font-medium">{user.name}</span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-6 w-6 rounded-lg">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* アカウント関連 */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/settings/account`}>
              <UserCircle />
              {t('navUser.account')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/settings/plan-billing`}>
              <CreditCard />
              {t('navUser.billing')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/settings/notifications`}>
              <Bell />
              {t('navUser.notifications')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 設定とヘルプ（Sidebarから移動） */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/settings`}>
              <Settings />
              {t('navUser.settings')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/help`}>
              <HelpCircle />
              {t('navUser.help')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ログアウト */}
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut />
          {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
