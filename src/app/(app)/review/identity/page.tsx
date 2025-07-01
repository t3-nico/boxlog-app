'use client'

import { useEffect, useState } from 'react'
import { Heading } from '@/components/heading'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Identity',
}

export default function IdentityPage() {
  const [value, setValue] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('identity')
      if (stored) setValue(stored)
    }
  }, [])

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('identity', value)
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <Heading>Identity</Heading>
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            あなたが自分自身をどう定義するか、自由に書いてください（例：好奇心旺盛な探究者。父であり、ものづくり好きな起業家）
          </p>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-40"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" onClick={handleSave}>
            保存
          </Button>
        </CardFooter>
      </Card>
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-md bg-zinc-800 px-4 py-2 text-white shadow">
          ✅ 保存しました
        </div>
      )}
    </div>
  )
}
