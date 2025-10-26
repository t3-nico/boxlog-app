'use client'

import { Clock, Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Session } from '../types/session'

interface SessionTimerProps {
  session: Session | null
  onStart?: () => void
  onStop?: () => void
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function calculateElapsed(startTime: string): number {
  const start = new Date(startTime).getTime()
  const now = Date.now()
  return Math.floor((now - start) / 1000 / 60) // 分単位
}

export function SessionTimer({ session, onStart, onStop }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  const isRunning = session?.status === 'in_progress' && session.actual_start

  useEffect(() => {
    if (!isRunning || !session?.actual_start) {
      setElapsed(0)
      return
    }

    // 初期値を設定
    setElapsed(calculateElapsed(session.actual_start))

    // 1分ごとに更新
    const interval = setInterval(() => {
      setElapsed(calculateElapsed(session.actual_start!))
    }, 60000) // 60秒 = 1分

    return () => clearInterval(interval)
  }, [isRunning, session?.actual_start])

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            タイマー
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">セッションを選択してください</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          {session.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 経過時間 */}
        <div className="text-center">
          <div className="text-foreground font-mono text-4xl font-bold">
            {isRunning ? formatDuration(elapsed) : '00:00'}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isRunning ? '実行中' : session.status === 'completed' ? '完了' : '停止中'}
          </p>
        </div>

        {/* コントロールボタン */}
        <div className="flex gap-2">
          {!isRunning && session.status !== 'completed' && onStart && (
            <Button onClick={onStart} className="flex-1 gap-2" variant="default">
              <Play className="h-4 w-4" />
              開始
            </Button>
          )}
          {isRunning && onStop && (
            <Button onClick={onStop} className="flex-1 gap-2" variant="destructive">
              <Square className="h-4 w-4" />
              停止
            </Button>
          )}
        </div>

        {/* 累計時間（完了時） */}
        {session.duration_minutes !== null && session.duration_minutes !== undefined && (
          <div className="border-border border-t pt-2 text-center">
            <p className="text-muted-foreground text-sm">合計所要時間</p>
            <p className="text-foreground text-lg font-semibold">{formatDuration(session.duration_minutes)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
