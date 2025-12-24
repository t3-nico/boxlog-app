'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { SettingsCard } from '../SettingsCard'

/**
 * ログアウトセクション
 */
export function LogoutSection() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success(t('navUser.logoutSuccess'))
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error(t('navUser.logoutFailed'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SettingsCard title={t('settings.account.session')}>
      <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className="w-full sm:w-auto">
        <LogOut className="size-4" />
        {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
      </Button>
    </SettingsCard>
  )
}
