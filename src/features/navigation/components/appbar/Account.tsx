'use client'

import {
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
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { useUserAuth } from './hooks/useUserAuth'

interface AccountProps {
  userData: {
    name: string
    email: string
    avatar: string | null
  }
  locale: 'ja' | 'en'
}

/**
 * AppBarアカウントセクション
 *
 * ユーザーアバターとドロップダウンメニュー（アカウント設定、ヘルプ、ログアウト）を表示
 */
export function Account({ userData, locale }: AccountProps) {
  const { t } = useI18n(locale)
  const { openSettings } = useSettingsDialogStore()
  const { handleLogout, isLoggingOut } = useUserAuth()

  return (
    <div className="bg-sidebar flex flex-col items-center justify-center px-2 pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:bg-accent data-[state=open]:bg-accent flex h-10 w-10 items-center justify-center rounded-xl outline-hidden"
          >
            <Avatar className="h-8 w-8 rounded-xl">
              {userData.avatar ? <AvatarImage src={userData.avatar} alt={userData.name} /> : null}
              <AvatarFallback className="rounded-xl">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border-input min-w-56 rounded-xl" side="right" align="start" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="h-6 w-6 rounded-xl">
                {userData.avatar ? <AvatarImage src={userData.avatar} alt={userData.name} /> : null}
                <AvatarFallback className="rounded-xl text-xs">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.name}</span>
                <span className="text-muted-foreground truncate text-xs">{userData.email}</span>
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

          {/* 設定とヘルプ */}
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
    </div>
  )
}
