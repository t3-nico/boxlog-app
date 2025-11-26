import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * ユーザー認証関連のカスタムhook
 *
 * @returns {Object} - ログアウト処理とログアウト状態
 */
export const useUserAuth = () => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
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
  }, [router])

  return { handleLogout, isLoggingOut }
}
