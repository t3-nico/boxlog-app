'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Textarea } from '@/components/textarea'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life Vision',
}

export default function LifeVisionPage() {
  const [vision, setVision] = useState('')
  const [showToast, setShowToast] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Life Vision</Heading>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        あなたが望む『人生の方向性』を書きましょう。肩書きや生活の様子、感じていたい感情など、自由に描いてください
      </p>
      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <Textarea
          aria-label="Life Vision"
          value={vision}
          onChange={(e) => setVision(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded bg-zinc-800 px-4 py-2 text-sm text-white shadow">
          保存しました
        </div>
      )}
    </div>
  )
}
