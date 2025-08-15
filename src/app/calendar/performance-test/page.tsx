'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { addDays } from 'date-fns'
import { Button } from '@/components/shadcn-ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Badge } from '@/components/shadcn-ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { PureCalendarLayoutOptimized, PerformanceTestWrapper } from '@/features/calendar/components/calendar-grid/PureCalendarLayoutOptimized'
import { 
  generateTestEvents, 
  generateOverlappingEvents, 
  generateMemoryTestEvents,
  PerformanceBenchmark,
  performanceTestCases 
} from '@/features/calendar/utils/performance-test-data'
import type { CalendarEvent } from '@/features/events'

export default function PerformanceTestPage() {
  const [selectedTestCase, setSelectedTestCase] = useState(performanceTestCases[0])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Array<{
    testName: string
    eventCount: number
    renderTime: number
    memoryDelta: number
    fps: number
    timestamp: Date
  }>>([])

  // テスト日付範囲
  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [])

  // 手動テスト実行
  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    try {
      const benchmark = new PerformanceBenchmark()
      
      // イベント生成
      console.log(`🧪 テスト開始: ${selectedTestCase.name}`)
      const testEvents = selectedTestCase.generate()
      
      // レンダリング時間測定
      benchmark.start()
      setEvents(testEvents)
      
      // 次のフレームで測定終了
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          benchmark.end()
          const testResults = benchmark.getResults()
          
          // 結果を保存
          const newResult = {
            testName: selectedTestCase.name,
            eventCount: testEvents.length,
            renderTime: testResults.renderTime,
            memoryDelta: testResults.memoryDelta,
            fps: testResults.fps,
            timestamp: new Date()
          }
          
          setResults(prev => [newResult, ...prev].slice(0, 10)) // 最新10件のみ保持
          benchmark.logResults(testEvents.length)
          
          resolve(undefined)
        })
      })
      
    } catch (error) {
      console.error('テスト実行エラー:', error)
    } finally {
      setIsRunning(false)
    }
  }, [selectedTestCase])

  // 全テストケース実行
  const runAllTests = useCallback(async () => {
    setIsRunning(true)
    
    for (const testCase of performanceTestCases) {
      console.log(`🧪 実行中: ${testCase.name}`)
      
      const benchmark = new PerformanceBenchmark()
      const testEvents = testCase.generate()
      
      benchmark.start()
      setEvents(testEvents)
      
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          benchmark.end()
          const testResults = benchmark.getResults()
          
          const newResult = {
            testName: testCase.name,
            eventCount: testEvents.length,
            renderTime: testResults.renderTime,
            memoryDelta: testResults.memoryDelta,
            fps: testResults.fps,
            timestamp: new Date()
          }
          
          setResults(prev => [newResult, ...prev])
          benchmark.logResults(testEvents.length)
          
          setTimeout(resolve, 500) // 500ms待機
        })
      })
    }
    
    setIsRunning(false)
  }, [])

  // 初期イベント生成
  useEffect(() => {
    setEvents(generateTestEvents(50, dates))
  }, [dates])

  // イベントハンドラー
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('イベントクリック:', event.title)
  }, [])

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  const handleCreateEvent = useCallback((date: Date, time: string) => {
    console.log('新しいイベント作成:', { date, time })
  }, [])

  // 結果の統計
  const stats = useMemo(() => {
    if (results.length === 0) return null

    const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length
    const maxRenderTime = Math.max(...results.map(r => r.renderTime))
    const minRenderTime = Math.min(...results.map(r => r.renderTime))

    return {
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      maxRenderTime,
      minRenderTime
    }
  }, [results])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">カレンダーパフォーマンステスト</h1>
            <p className="text-muted-foreground">
              イベントレンダリングのパフォーマンスを測定・最適化
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 現在のイベント数 */}
            <Badge variant="outline">
              {events.length} イベント
            </Badge>
            
            {/* テストケース選択 */}
            <Select
              value={selectedTestCase.name}
              onValueChange={(value) => {
                const testCase = performanceTestCases.find(tc => tc.name === value)
                if (testCase) setSelectedTestCase(testCase)
              }}
              disabled={isRunning}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {performanceTestCases.map(testCase => (
                  <SelectItem key={testCase.name} value={testCase.name}>
                    {testCase.name} ({testCase.eventCount}件)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* テスト実行ボタン */}
            <Button onClick={runTest} disabled={isRunning}>
              {isRunning ? '実行中...' : 'テスト実行'}
            </Button>
            
            <Button onClick={runAllTests} disabled={isRunning} variant="outline">
              全テスト実行
            </Button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* カレンダー */}
        <div className="flex-1 flex flex-col">
          <PerformanceTestWrapper eventCount={events.length}>
            <PureCalendarLayoutOptimized
              dates={dates}
              events={events}
              onEventClick={handleEventClick}
              onDeleteEvent={handleDeleteEvent}
              onCreateEvent={handleCreateEvent}
            />
          </PerformanceTestWrapper>
        </div>

        {/* サイドパネル */}
        <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
          {/* 現在のテストケース */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">現在のテストケース</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-medium">{selectedTestCase.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedTestCase.description}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedTestCase.eventCount}件
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 統計情報 */}
          {stats && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">統計情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">平均</div>
                    <div className="font-medium">{stats.avgRenderTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">最大</div>
                    <div className="font-medium">{stats.maxRenderTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">最小</div>
                    <div className="font-medium">{stats.minRenderTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">実行回数</div>
                    <div className="font-medium">{results.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* テスト結果履歴 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">テスト結果履歴</CardTitle>
              <CardDescription>
                最新{Math.min(results.length, 10)}件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.slice(0, 10).map((result, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.testName}</span>
                      <Badge 
                        variant={result.renderTime > 50 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {result.renderTime}ms
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>イベント: {result.eventCount}</div>
                      <div>FPS: {result.fps}</div>
                      <div>メモリ: {result.memoryDelta}KB</div>
                      <div>{result.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                
                {results.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    テストを実行してください
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* パフォーマンス目標 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">パフォーマンス目標</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>100イベント:</span>
                <span>&lt;50ms</span>
              </div>
              <div className="flex justify-between">
                <span>1000イベント:</span>
                <span>&lt;1000ms</span>
              </div>
              <div className="flex justify-between">
                <span>スクロールFPS:</span>
                <span>60fps</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}