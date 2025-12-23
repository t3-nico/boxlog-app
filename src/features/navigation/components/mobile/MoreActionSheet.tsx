'use client'

import { useRouter } from 'next/navigation'

import { BarChart3, Bell, Search } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useTranslations } from 'next-intl'

interface MoreActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'ja' | 'en'
}

/**
 * 「その他」ボトムシート
 *
 * Claude/ChatGPT モバイル風のシンプルな構成:
 * - ユーザーカード → /settings へ遷移
 * - ナビゲーション項目（検索、通知、統計）
 * - ログアウトは設定内で管理
 */
export function MoreActionSheet({ open, onOpenChange, locale }: MoreActionSheetProps) {
  const router = useRouter()
  const t = useTranslations()
  const user = useAuthStore((state) => state.user)

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  const handleNavigation = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const menuItems = [
    {
      id: 'search',
      label: t('sidebar.navigation.search'),
      icon: Search,
      onClick: () => handleNavigation(`/${locale}/search`),
    },
    {
      id: 'notifications',
      label: t('sidebar.navigation.notifications'),
      icon: Bell,
      onClick: () => handleNavigation(`/${locale}/notifications`),
    },
    {
      id: 'stats',
      label: t('sidebar.navigation.stats'),
      icon: BarChart3,
      onClick: () => handleNavigation(`/${locale}/stats`),
    },
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe-area-inset-bottom">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{t('navigation.more.title')}</DrawerTitle>
          <DrawerDescription>{t('navigation.more.description')}</DrawerDescription>
        </DrawerHeader>

        {/* User Info → Settings */}
        <button
          type="button"
          onClick={() => handleNavigation(`/${locale}/settings`)}
          className="active:bg-muted flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
        >
          <Avatar className="size-12">
            {userData.avatar ? <AvatarImage src={userData.avatar} alt={userData.name} /> : null}
            <AvatarFallback className="text-lg">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-base font-medium">{userData.name}</p>
            <p className="text-muted-foreground truncate text-sm">{userData.email}</p>
          </div>
        </button>

        {/* Divider */}
        <div className="border-border mx-5 border-t" />

        {/* Navigation Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="active:bg-muted flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
              >
                <Icon className="text-foreground size-5" />
                <span className="text-foreground flex-1">{item.label}</span>
              </button>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
