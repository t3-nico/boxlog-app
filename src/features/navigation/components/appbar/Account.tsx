'use client'

import {
  Building,
  ExternalLink,
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
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
  const openSettings = useSettingsDialogStore((state) => state.openSettings)
  const { handleLogout, isLoggingOut } = useUserAuth()

  return (
    <div className="flex flex-col items-center justify-center px-2 py-2" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('navUser.accountMenuLabel', { name: userData.name })}
            className="hover:bg-state-hover data-[state=open]:bg-secondary flex h-10 w-10 items-center justify-center rounded-xl outline-hidden transition-colors"
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
                    <span className="flex-1">{t('navUser.helpSubmenu.releaseNotes')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/legal/terms`} target="_blank" rel="noopener noreferrer">
                    <FileText />
                    <span className="flex-1">{t('navUser.helpSubmenu.termsOfService')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/legal/privacy`} target="_blank" rel="noopener noreferrer">
                    <FileText />
                    <span className="flex-1">{t('navUser.helpSubmenu.privacyPolicy')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/legal/tokushoho`} target="_blank" rel="noopener noreferrer">
                    <Building />
                    <span className="flex-1">{t('navUser.helpSubmenu.tokushoho')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/legal/security`} target="_blank" rel="noopener noreferrer">
                    <Shield />
                    <span className="flex-1">{t('navUser.helpSubmenu.security')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="mailto:support@boxlog.app">
                    <Mail />
                    <span className="flex-1">{t('navUser.helpSubmenu.contact')}</span>
                    <ExternalLink className="text-muted-foreground size-3" />
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
