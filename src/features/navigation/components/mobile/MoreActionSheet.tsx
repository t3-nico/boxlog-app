'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { BarChart3, ChevronRight, LogOut, Moon, Settings, Sun } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useTheme } from '@/contexts/theme-context'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface MoreActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'ja' | 'en'
}

/**
 * 「その他」ボトムシート
 *
 * CreateActionSheetと同じデザインパターンで統一
 * - 統計
 * - 設定 → /settings ページへ遷移
 * - テーマ切替
 * - ログアウト
 */
export function MoreActionSheet({ open, onOpenChange, locale }: MoreActionSheetProps) {
  const router = useRouter()
  const t = useTranslations()
  const { resolvedTheme, setTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  const handleNavigation = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
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
      toast.error(t('errors.generic'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      id: 'stats',
      label: t('sidebar.navigation.stats'),
      description: t('navigation.more.statsDescription'),
      icon: BarChart3,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
      onClick: () => handleNavigation(`/${locale}/stats`),
      showArrow: true,
    },
    {
      id: 'settings',
      label: t('navUser.settings'),
      description: t('navigation.more.settingsDescription'),
      icon: Settings,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      onClick: () => handleNavigation(`/${locale}/settings`),
      showArrow: true,
    },
    {
      id: 'theme',
      label: resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark'),
      description: t('navigation.more.themeDescription'),
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      onClick: handleToggleTheme,
      showArrow: false,
    },
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe-area-inset-bottom">
        <DrawerHeader className="text-center">
          <DrawerTitle>{t('navigation.more.title')}</DrawerTitle>
          <DrawerDescription className="sr-only">{t('navigation.more.description')}</DrawerDescription>
        </DrawerHeader>

        {/* User Info Card */}
        <div className="mx-4 mb-4">
          <button
            type="button"
            onClick={() => handleNavigation(`/${locale}/settings/account`)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl p-4',
              'bg-card hover:bg-state-hover',
              'border-border border',
              'text-left transition-colors',
              'active:scale-[0.98]'
            )}
          >
            <Avatar className="size-12">
              {userData.avatar ? <AvatarImage src={userData.avatar} alt={userData.name} /> : null}
              <AvatarFallback className="text-lg">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-foreground font-medium">{userData.name}</p>
              <p className="text-muted-foreground text-sm">{userData.email}</p>
            </div>
            <ChevronRight className="text-muted-foreground size-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'flex items-center gap-4 rounded-xl p-4',
                  'bg-card hover:bg-state-hover',
                  'border-border border',
                  'text-left transition-colors',
                  'active:scale-[0.98]'
                )}
              >
                <div className={cn('flex size-12 items-center justify-center rounded-full', item.bgColor)}>
                  <Icon className={cn('size-6', item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
                {item.showArrow && <ChevronRight className="text-muted-foreground size-5" />}
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <div className="mt-4 px-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl p-4',
              'bg-destructive/5 hover:bg-destructive/10',
              'border-destructive/20 border',
              'text-left transition-colors',
              'active:scale-[0.98]',
              'disabled:opacity-50'
            )}
          >
            <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
              <LogOut className="text-destructive size-6" />
            </div>
            <div className="flex-1">
              <p className="text-destructive font-medium">
                {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
              </p>
              <p className="text-destructive/70 text-sm">{t('navigation.more.logoutDescription')}</p>
            </div>
          </button>
        </div>

        <DrawerClose asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mx-4 mt-4 mb-4 rounded-xl py-3 text-center text-sm transition-colors"
          >
            {t('common.close')}
          </button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
