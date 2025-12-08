import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * ユーザー認証関連のカスタムhook
 *
 * @returns {Object} - ログアウト処理とログアウト状態
 */
export const useUserAuth = () => {
  const t = useTranslations()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
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
  }, [router, t])

  return { handleLogout, isLoggingOut }
}
