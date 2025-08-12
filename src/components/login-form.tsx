'use client'

import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // ローカル専用モードのため、認証をスキップ
    router.push('/today')
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">BoxLog</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ローカル専用モード
          </p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            アプリを開始
          </button>
        </form>
      </div>
    </div>
  )
}