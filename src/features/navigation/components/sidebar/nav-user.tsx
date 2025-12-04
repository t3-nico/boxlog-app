'use client'

import {
  ChevronDown,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Megaphone,
  Palette,
  Settings,
  Shield,
  Sparkles,
  UserCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { createClient } from '@/lib/supabase/client'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const openSettings = useSettingsDialogStore((state) => state.openSettings)
  const t = useTranslations()
  const locale = useLocale()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('ログアウトしました')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('ログアウトに失敗しました')
    } finally {
      setIsLoggingOut(false)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-foreground/8 data-[state=open]:bg-foreground/12 flex w-fit items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-hidden"
        >
          <Avatar className="h-6 w-6 rounded-xl">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="rounded-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="max-w-20 truncate font-medium">{user.name}</span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border-input w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
        side="right"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-6 w-6 rounded-xl">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="rounded-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
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
          <DropdownMenuItem onClick={() => openSettings('account')}>
            <UserCircle />
            {t('navUser.account')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openSettings('subscription')}>
            <Sparkles />
            {t('navUser.upgradePlan')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openSettings('personalization')}>
            <Palette />
            {t('navUser.personalize')}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 設定とヘルプ（Sidebarから移動） */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openSettings('general')}>
            <Settings />
            {t('navUser.settings')}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HelpCircle />
              {t('navUser.help')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuItem asChild>
                <Link href="https://github.com/t3-nico/boxlog-app/releases" target="_blank" rel="noopener noreferrer">
                  <Megaphone />
                  {t('navUser.helpSubmenu.releaseNotes')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/terms`}>
                  <FileText />
                  {t('navUser.helpSubmenu.termsOfService')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/privacy`}>
                  <FileText />
                  {t('navUser.helpSubmenu.privacyPolicy')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/security`}>
                  <Shield />
                  {t('navUser.helpSubmenu.security')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="mailto:support@boxlog.app">
                  <Mail />
                  {t('navUser.helpSubmenu.contact')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ログアウト */}
        <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut />
          {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
