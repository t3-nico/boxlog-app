'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Textarea } from '@/components/textarea'
import { Toast } from '@/components/toast'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AntiValues',
}

export default function AntiValuesPage() {
  const [value, setValue] = useState('')
  const [showToast, setShowToast] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
    setShowToast(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Heading>AntiValues</Heading>
      <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-zinc-950/5 p-4 dark:border-white/10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          苦手な価値観、嫌悪感を覚える考え方を列挙してください（例：責任のなすりつけ、思考停止、形式主義）
        </p>
        <Textarea
          aria-label="AntiValues"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-40"
        />
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
      <Toast message="Saved" show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}
