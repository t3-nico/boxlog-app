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

import React from 'react'

import { useRouter } from 'next/navigation'

import {
  LogOut as ArrowRightStartOnRectangleIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react'

import { Avatar } from '@/components/shadcn-ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import { rounded, animations, icons, colors } from '@/config/theme'
import { useAuthContext } from '@/features/auth'
import { cn } from '@/lib/utils'

const { md, lg } = icons.size

interface UserMenuProps {
  children?: React.ReactNode
}

export const UserMenu = ({ children }: UserMenuProps) => {
  const router = useRouter()
  const { user, signOut } = useAuthContext()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? children : (
          <button className={cn(
            'flex items-center justify-center group',
            colors.hover.subtle,
            rounded.component.button.lg,
            animations.transition.fast
          )}>
            <div className="relative">
              {user?.user_metadata?.avatar_url ? (
                <Avatar 
                  src={user.user_metadata.avatar_url} 
                  className={cn(
                    lg, 'border',
                    colors.border.default,
                    rounded.component.avatar.md
                  )}
                />
              ) : user?.user_metadata?.profile_icon ? (
                <div className={cn(
                  lg, 'text-sm flex items-center justify-center bg-accent border',
                  colors.border.default,
                  rounded.component.avatar.md
                )}>
                  {user.user_metadata.profile_icon}
                </div>
              ) : (
                <Avatar 
                  src={undefined}
                  className={cn(
                    lg, 'border',
                    colors.border.default,
                    rounded.component.avatar.md
                  )}
                  initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                />
              )}
            </div>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className={cn(
          "w-64 z-[9999]",
          colors.background.surface,
          colors.border.default
        )}
        side="top" 
        align="start"
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={() => router.push('/settings')}
          className={cn('focus:bg-transparent', colors.hover.subtle)}
        >
          <Cog8ToothIcon className={cn(md, 'mr-2')} />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          asChild
          className={cn('focus:bg-transparent', colors.hover.subtle)}
        >
          <a href="#">
            <ShieldCheckIcon className={cn(md, 'mr-2')} />
            Privacy policy
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem 
          asChild
          className={cn('focus:bg-transparent', colors.hover.subtle)}
        >
          <a href="#">
            <LightBulbIcon className={cn(md, 'mr-2')} />
            Share feedback
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => router.push('/help')}
          className={cn('focus:bg-transparent', colors.hover.subtle)}
        >
          <QuestionMarkCircleIcon className={cn(md, 'mr-2')} />
          Help
        </DropdownMenuItem>

        <DropdownMenuItem 
          asChild
          className={cn('focus:bg-transparent', colors.hover.subtle)}
        >
          <a href="#">
            <SparklesIcon className={cn(md, 'mr-2')} />
            Changelog
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className={cn(
            'focus:bg-transparent focus:text-accent-foreground',
            colors.semantic.warning.hover
          )}
        >
          <ArrowRightStartOnRectangleIcon className={cn(md, 'mr-2')} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}