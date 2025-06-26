'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message') || '不明なエラーが発生しました'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          戻る
        </button>
      </div>
    </div>
  )
} 