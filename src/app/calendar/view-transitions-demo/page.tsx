'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Button } from '@/components/shadcn-ui/button'
import { Badge } from '@/components/shadcn-ui/badge'
import { 
  CalendarView, 
  SlideDirection,
  AdvancedViewTransition,
  AdvancedSlideTransition,
  EventCollapse,
  StaggeredAnimation,
  SpringAnimation,
  TouchAnimation,
  PerformanceIndicator,
  useViewTransition,
  useAnimationPerformance
} from '@/features/calendar/components/calendar-grid/ViewTransition'

// サンプルカレンダーコンテンツ
function CalendarContent({ view }: { view: CalendarView }) {
  const content = {
    day: { title: '日ビュー', color: 'bg-blue-100', items: ['09:00 会議', '14:00 ランチ'] },
    'split-day': { title: '分割日ビュー', color: 'bg-green-100', items: ['午前: 作業', '午後: 会議'] },
    '3day': { title: '3日ビュー', color: 'bg-yellow-100', items: ['今日', '明日', '明後日'] },
    week: { title: '週ビュー', color: 'bg-purple-100', items: ['月', '火', '水', '木', '金', '土', '日'] },
    'week-no-weekend': { title: '平日ビュー', color: 'bg-pink-100', items: ['月', '火', '水', '木', '金'] },
    '2week': { title: '2週ビュー', color: 'bg-indigo-100', items: ['第1週', '第2週'] },
    schedule: { title: 'スケジュールビュー', color: 'bg-red-100', items: ['08:00-09:00', '10:00-11:00'] },
    month: { title: '月ビュー', color: 'bg-gray-100', items: ['週1', '週2', '週3', '週4'] }
  }

  const viewData = content[view]

  return (
    <div className={`h-64 rounded-lg p-6 ${viewData.color}`}>
      <h3 className="text-xl font-bold mb-4">{viewData.title}</h3>
      <div className="grid gap-2">
        {viewData.items.map((item, index) => (
          <div key={index} className="p-2 bg-white rounded shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// スライドデモコンテンツ
function SlideContent({ direction }: { direction: SlideDirection }) {
  const colors = {
    left: 'bg-blue-500',
    right: 'bg-green-500',
    up: 'bg-yellow-500',
    down: 'bg-red-500'
  }

  return (
    <div className={`h-32 rounded-lg p-4 text-white ${colors[direction]} flex items-center justify-center`}>
      <span className="text-lg font-bold">スライド: {direction}</span>
    </div>
  )
}

export default function ViewTransitionsDemoPage() {
  const { currentView, direction, isTransitioning, changeView, handleTransitionComplete } = useViewTransition()
  const { fps } = useAnimationPerformance()
  
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('right')
  const [isExpanded, setIsExpanded] = useState(false)
  const [springActive, setSpringActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const views: CalendarView[] = ['day', 'split-day', '3day', 'week', 'week-no-weekend', '2week', 'schedule', 'month']
  const directions: SlideDirection[] = ['left', 'right', 'up', 'down']

  // プログレスバーのシミュレーション
  const simulateLoading = () => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">ビュー切り替えアニメーションデモ</h1>
        <Badge variant="secondary">FPS: {fps}</Badge>
      </div>

      {/* 1. ビュー切り替えアニメーション */}
      <Card>
        <CardHeader>
          <CardTitle>1. ビュー切り替えアニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {views.map((view) => (
                <Button
                  key={view}
                  variant={currentView === view ? "default" : "outline"}
                  size="sm"
                  disabled={isTransitioning}
                  onClick={() => changeView(view)}
                >
                  {view}
                </Button>
              ))}
            </div>
            
            <AdvancedViewTransition
              currentView={currentView}
              onTransitionComplete={handleTransitionComplete}
              className="border rounded-lg"
            >
              <CalendarContent view={currentView} />
            </AdvancedViewTransition>
          </div>
        </CardContent>
      </Card>

      {/* 2. スライドアニメーション */}
      <Card>
        <CardHeader>
          <CardTitle>2. スライドアニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {directions.map((dir) => (
                <Button
                  key={dir}
                  variant={slideDirection === dir ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlideDirection(dir)}
                >
                  {dir}
                </Button>
              ))}
            </div>
            
            <AdvancedSlideTransition
              direction={slideDirection}
              className="border rounded-lg"
            >
              <SlideContent direction={slideDirection} />
            </AdvancedSlideTransition>
          </div>
        </CardContent>
      </Card>

      {/* 3. イベント展開/折りたたみ */}
      <Card>
        <CardHeader>
          <CardTitle>3. イベント展開/折りたたみアニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant={isExpanded ? "default" : "outline"}
            >
              {isExpanded ? '折りたたむ' : '展開する'}
            </Button>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">イベント詳細</h3>
              <EventCollapse isExpanded={isExpanded}>
                <div className="space-y-2 p-4">
                  <p>開始時間: 2024年1月15日 14:00</p>
                  <p>終了時間: 2024年1月15日 15:30</p>
                  <p>場所: 会議室A</p>
                  <p>参加者: 田中さん、佐藤さん、山田さん</p>
                  <p>説明: プロジェクトの進捗確認と今後の方針について話し合います。</p>
                  <p>資料: プロジェクト資料.pdf</p>
                </div>
              </EventCollapse>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. ステガードアニメーション */}
      <Card>
        <CardHeader>
          <CardTitle>4. ステガード（段階的）アニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <StaggeredAnimation staggerDelay={0.1}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg mb-2">
                アイテム {index + 1}
              </div>
            ))}
          </StaggeredAnimation>
        </CardContent>
      </Card>

      {/* 5. スプリングアニメーション */}
      <Card>
        <CardHeader>
          <CardTitle>5. スプリングアニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => setSpringActive(!springActive)}
              variant={springActive ? "default" : "outline"}
            >
              {springActive ? 'リセット' : 'アクティブ化'}
            </Button>
            
            <SpringAnimation
              isActive={springActive}
              springConfig={{ stiffness: 200, damping: 20, mass: 1 }}
            >
              <div className="w-32 h-32 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                Spring
              </div>
            </SpringAnimation>
          </div>
        </CardContent>
      </Card>

      {/* 6. タッチアニメーション */}
      <Card>
        <CardHeader>
          <CardTitle>6. タッチアニメーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <TouchAnimation onTap={() => alert('タップされました！')}>
              <div className="h-24 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer">
                タップしてください
              </div>
            </TouchAnimation>
            
            <TouchAnimation onTap={() => alert('ボタンが押されました！')}>
              <Button className="h-24 w-full">
                モバイル対応ボタン
              </Button>
            </TouchAnimation>
          </div>
        </CardContent>
      </Card>

      {/* 7. パフォーマンスインジケーター */}
      <Card>
        <CardHeader>
          <CardTitle>7. パフォーマンスインジケーター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={simulateLoading}>
              ローディングシミュレーション
            </Button>
            
            <PerformanceIndicator
              isLoading={isLoading}
              progress={progress}
            />
          </div>
        </CardContent>
      </Card>

      {/* パフォーマンス情報 */}
      <Card>
        <CardHeader>
          <CardTitle>パフォーマンス情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{fps}</div>
              <div className="text-sm text-gray-600">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">GPU</div>
              <div className="text-sm text-gray-600">加速</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">60fps</div>
              <div className="text-sm text-gray-600">目標</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">✓</div>
              <div className="text-sm text-gray-600">最適化</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用方法 */}
      <Card>
        <CardHeader>
          <CardTitle>使用方法</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">AdvancedViewTransition</h4>
              <p className="text-gray-600">カレンダービューの切り替えに最適化されたアニメーション</p>
            </div>
            <div>
              <h4 className="font-semibold">AdvancedSlideTransition</h4>
              <p className="text-gray-600">日付/週の移動時のスライドアニメーション</p>
            </div>
            <div>
              <h4 className="font-semibold">EventCollapse</h4>
              <p className="text-gray-600">イベント詳細の展開/折りたたみアニメーション</p>
            </div>
            <div>
              <h4 className="font-semibold">GPU加速</h4>
              <p className="text-gray-600">transform, opacityのみを使用し、will-changeで最適化</p>
            </div>
            <div>
              <h4 className="font-semibold">reducedMotion対応</h4>
              <p className="text-gray-600">ユーザーの設定に応じてアニメーションを制限</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}