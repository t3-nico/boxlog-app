// import { createClient } from '@/lib/supabase/server' // Disabled for localStorage mode
// import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // ローカル専用モード: 常にアクセス可能
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard (localStorage mode)</h1>
      <p className="mt-4 text-gray-600">Welcome, local user!</p>
      
      <div className="mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          disabled
        >
          Sign out (disabled in localStorage mode)
        </button>
      </div>
    </div>
  )
}