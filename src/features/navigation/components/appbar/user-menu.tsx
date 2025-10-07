'use client'

/**
 * UserMenu コンポーネント
 *
 * ユーザーアカウント情報の表示とメニュー機能を提供
 *
 * ## 主要機能
 * - アバター表示（URL/アイコン/イニシャル対応）
 * - ドロップダウンメニュー（設定、サポート、ログアウト等）
 * - children props対応で外部からトリガー要素をカスタマイズ可能
 *
 * ## v4.0での変更点
 * - Headless UI → shadcn/ui DropdownMenu に移行（プロジェクトルール準拠）
 * - Radix UI ベースによるアクセシビリティ自動改善
 * - side="top" align="start" で真上・左寄せ配置
 *
 * @param {React.ReactNode} children - カスタムトリガー要素（未指定時はデフォルトボタン）
 */

import React, { useCallback } from 'react'

import { useRouter } from 'next/navigation'

import {
  LogOut as ArrowRightStartOnRectangleIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthContext } from '@/features/auth'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  children?: React.ReactNode
}

export const UserMenu = ({ children }: UserMenuProps) => {
  const router = useRouter()
  const { user, signOut } = useAuthContext()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [signOut, router])

  const handleSettingsClick = useCallback(() => {
    router.push('/settings')
  }, [router])

  const handleHelpClick = useCallback(() => {
    router.push('/help')
  }, [router])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            className={cn(
              'group flex items-center justify-center',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'rounded-lg',
              'transition-colors duration-150'
            )}
          >
            <div className="relative">
              {user?.user_metadata?.profile_icon ? (
                <div
                  className={cn(
                    'h-8 w-8',
                    'bg-accent flex items-center justify-center border text-sm',
                    'border-neutral-200 dark:border-neutral-800',
                    'rounded-md'
                  )}
                >
                  {user.user_metadata.profile_icon}
                </div>
              ) : (
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U')
                    .charAt(0)
                    .toUpperCase()}
                  className={cn('h-8 w-8', 'border', 'border-neutral-200 dark:border-neutral-800', 'rounded-md')}
                />
              )}
            </div>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn('z-[9999] w-64', 'bg-white dark:bg-neutral-800', 'border-neutral-200 dark:border-neutral-800')}
        side="top"
        align="start"
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-muted-foreground text-xs leading-none">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSettingsClick} className={cn('focus:bg-transparent', 'hover:bg-neutral-100 dark:hover:bg-neutral-700')}>
          <Cog8ToothIcon className={cn('h-4 w-4', 'mr-2')} />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={cn('focus:bg-transparent', 'hover:bg-neutral-100 dark:hover:bg-neutral-700')}
          onClick={() => {
            // TODO: Implement privacy policy navigation
            console.log('Privacy policy clicked')
          }}
        >
          <ShieldCheckIcon className={cn('h-4 w-4', 'mr-2')} />
          Privacy policy
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn('focus:bg-transparent', 'hover:bg-neutral-100 dark:hover:bg-neutral-700')}
          onClick={() => {
            // TODO: Implement feedback navigation
            console.log('Share feedback clicked')
          }}
        >
          <LightBulbIcon className={cn('h-4 w-4', 'mr-2')} />
          Share feedback
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleHelpClick} className={cn('focus:bg-transparent', 'hover:bg-neutral-100 dark:hover:bg-neutral-700')}>
          <QuestionMarkCircleIcon className={cn('h-4 w-4', 'mr-2')} />
          Help
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn('focus:bg-transparent', 'hover:bg-neutral-100 dark:hover:bg-neutral-700')}
          onClick={() => {
            // TODO: Implement changelog navigation
            console.log('Changelog clicked')
          }}
        >
          <SparklesIcon className={cn('h-4 w-4', 'mr-2')} />
          Changelog
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className={cn('focus:text-accent-foreground focus:bg-transparent', 'hover:bg-orange-50 dark:hover:bg-orange-950')}
        >
          <ArrowRightStartOnRectangleIcon className={cn('h-4 w-4', 'mr-2')} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
