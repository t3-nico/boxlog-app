'use client'

import { useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { BarChart3, Calendar, Inbox, LogOut, Moon, MoreHorizontal, Settings, Sun, Tag, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useTheme } from '@/contexts/theme-context'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import type { SettingsCategory } from '@/features/settings/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/**
 * モバイル用ボトムナビゲーション
 *
 * 4項目構成:
 * - Calendar: カレンダーページ
 * - Inbox: 受信箱ページ
 * - Tags: タグ管理ページ
 * - More: その他メニュー（シート展開）
 *
 * **デザイン仕様**:
 * - 高さ: 64px（h-16）
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 */
export function MobileBottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // URLから locale を抽出
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t, locale } = useI18n(localeFromPath)

  // ナビゲーション項目
  const navItems = [
    {
      id: 'calendar',
      label: t('sidebar.navigation.calendar'),
      href: `/${locale}/calendar`,
      icon: Calendar,
      isActive: pathname?.includes('/calendar') ?? false,
    },
    {
      id: 'inbox',
      label: t('sidebar.navigation.inbox'),
      href: `/${locale}/inbox`,
      icon: Inbox,
      isActive: pathname?.includes('/inbox') ?? false,
    },
    {
      id: 'tags',
      label: t('sidebar.navigation.tags'),
      href: `/${locale}/tags`,
      icon: Tag,
      isActive: pathname?.includes('/tags') ?? false,
    },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <>
      <nav
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50',
          'flex items-center',
          'h-16',
          'bg-background border-border border-t'
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item.href)}
              className="flex h-full flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full p-2 transition-colors',
                  item.isActive && 'bg-primary/15'
                )}
              >
                <Icon
                  className={cn('size-5 transition-colors', item.isActive ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
              <span
                className={cn(
                  'text-xs leading-tight transition-colors',
                  item.isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
        >
          <div className="flex items-center justify-center rounded-full p-2">
            <MoreHorizontal className="text-muted-foreground size-5" />
          </div>
          <span className="text-muted-foreground text-xs leading-tight">{t('navigation.more')}</span>
        </button>
      </nav>

      {/* More Sheet */}
      <MoreSheet open={isMoreOpen} onOpenChange={setIsMoreOpen} locale={locale} />
    </>
  )
}

/**
 * Moreシート - その他のメニュー項目
 */
function MoreSheet({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'ja' | 'en'
}) {
  const router = useRouter()
  const { t } = useI18n(locale)
  const { resolvedTheme, setTheme } = useTheme()
  const { openSettings } = useSettingsDialogStore()
  const user = useAuthStore((state) => state.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const handleOpenSettings = (tab?: string) => {
    openSettings(tab as SettingsCategory | undefined)
    onOpenChange(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success(t('auth.messages.logoutSuccess'))
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error(t('common.error'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      id: 'stats',
      label: t('sidebar.navigation.stats'),
      icon: BarChart3,
      onClick: () => handleNavigation(`/${locale}/stats`),
    },
    {
      id: 'settings',
      label: t('navUser.settings'),
      icon: Settings,
      onClick: () => handleOpenSettings('general'),
    },
    {
      id: 'theme',
      label: resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark'),
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      onClick: handleToggleTheme,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="sr-only">{t('navigation.more')}</SheetTitle>

          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <Avatar className="size-10">
              {userData.avatar ? <AvatarImage src={userData.avatar} alt={userData.name} /> : null}
              <AvatarFallback>{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{userData.name}</p>
              <p className="text-muted-foreground text-xs">{userData.email}</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenSettings('account')}
              className="text-muted-foreground hover:bg-foreground/8 rounded-full p-2 transition-colors"
              aria-label={t('navUser.account')}
            >
              <User className="size-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Menu Items */}
        <div className="space-y-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="text-foreground hover:bg-foreground/8 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors"
              >
                <Icon className="text-muted-foreground size-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <div className="border-border border-t pt-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors disabled:opacity-50"
          >
            <LogOut className="size-5" />
            <span>{isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
