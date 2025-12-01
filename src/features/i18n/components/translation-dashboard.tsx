'use client'

/**
 * 翻訳進捗ダッシュボードコンポーネント
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 */

import { useEffect, useState } from 'react'

import { AlertTriangle, CheckCircle, Clock, Download, Edit, Eye, FileText, Globe, TrendingUp } from 'lucide-react'
// Note: recharts is not installed - commenting out chart imports
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 型定義（translation-tracker.tsから）
interface TranslationProgress {
  language: string
  totalKeys: number
  completedKeys: number
  partialKeys: number
  missingKeys: number
  reviewedKeys: number
  pendingReviewKeys: number
  completionRate: number
  reviewRate: number
  lastUpdated: Date
}

interface TranslationKey {
  key: string
  path: string[]
  value: string
  status: 'complete' | 'partial' | 'missing' | 'outdated'
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  reviewer?: string
  comments?: string[]
}

interface TranslationReport {
  overview: {
    supportedLanguages: string[]
    totalKeys: number
    globalCompletionRate: number
  }
  languageProgress: TranslationProgress[]
  missingTranslations: { [language: string]: TranslationKey[] }
  reviewQueue: { [language: string]: TranslationKey[] }
  recentChanges: { [language: string]: TranslationKey[] }
}

interface TranslationHealth {
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

/**
 * 翻訳進捗ダッシュボードコンポーネント
 */
export function TranslationDashboard() {
  const [report, setReport] = useState<TranslationReport | null>(null)
  const [health, setHealth] = useState<TranslationHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadTranslationData()
  }, [])

  const loadTranslationData = async () => {
    try {
      setLoading(true)

      // APIからデータを取得（後で実装）
      // const reportResponse = await fetch('/api/i18n/report')
      // const healthResponse = await fetch('/api/i18n/health')

      // モックデータ（実際の実装では削除）
      setReport(mockTranslationReport)
      setHealth(mockTranslationHealth)
    } catch (error) {
      console.error('翻訳データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = async () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `translation-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = async () => {
    if (!report) return

    let csv = 'Language,Total Keys,Completed,Missing,Completion Rate,Review Rate\n'

    for (const progress of report.languageProgress) {
      csv += `${progress.language},${progress.totalKeys},${progress.completedKeys},${progress.missingKeys},${progress.completionRate.toFixed(1)}%,${progress.reviewRate.toFixed(1)}%\n`
    }

    const dataBlob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `translation-progress-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-neutral-800 dark:text-neutral-200">翻訳データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-900">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>データ読み込みエラー</AlertTitle>
          <AlertDescription>翻訳データの読み込みに失敗しました。ページを再読み込みしてください。</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">翻訳進捗ダッシュボード</h1>
            <p className="text-neutral-800 dark:text-neutral-200">BoxLogアプリケーションの多言語化進捗状況</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={loadTranslationData} variant="outline" size="sm">
              更新
            </Button>
          </div>
        </div>

        {/* ヘルスアラート */}
        {health && health.errors.length > 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>緊急対応が必要</AlertTitle>
            <AlertDescription>
              {health.errors.map((error, index) => (
                <div key={index} className="mb-1">
                  {error}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        ) : null}

        {health && health.warnings.length > 0 ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>注意事項</AlertTitle>
            <AlertDescription>
              {health.warnings.map((warning, index) => (
                <div key={index} className="mb-1">
                  {warning}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        ) : null}

        {/* 概要カード */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">サポート言語</CardTitle>
              <Globe className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overview.supportedLanguages.length}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {report.overview.supportedLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総キー数</CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overview.totalKeys}</div>
              <p className="text-muted-foreground text-xs">翻訳対象キーの総数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">全体完了率</CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overview.globalCompletionRate.toFixed(1)}%</div>
              <Progress value={report.overview.globalCompletionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">レビュー待ち</CardTitle>
              <Eye className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(report.reviewQueue).reduce((sum, queue) => sum + queue.length, 0)}
              </div>
              <p className="text-muted-foreground text-xs">レビュー待ちキー数</p>
            </CardContent>
          </Card>
        </div>

        {/* 詳細タブ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="progress">進捗詳細</TabsTrigger>
            <TabsTrigger value="missing">欠落翻訳</TabsTrigger>
            <TabsTrigger value="review">レビュー待ち</TabsTrigger>
            <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 完了率チャート */}
              <Card>
                <CardHeader>
                  <CardTitle>言語別完了率</CardTitle>
                  <CardDescription>各言語の翻訳完了状況</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* TODO: Install recharts package to enable charts */}
                  <div className="text-muted-foreground flex h-80 items-center justify-center">
                    <p>Chart visualization (recharts package required)</p>
                  </div>
                  {/* <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={report.languageProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="language" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="completionRate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer> */}
                </CardContent>
              </Card>

              {/* ステータス分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>翻訳ステータス分布</CardTitle>
                  <CardDescription>全言語のキーステータス合計</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* TODO: Install recharts package to enable charts */}
                  <div className="text-muted-foreground flex h-80 items-center justify-center">
                    <p>Pie chart visualization (recharts package required)</p>
                  </div>
                  {/* <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: '完了',
                            value: report.languageProgress.reduce((sum, p) => sum + p.completedKeys, 0)
                          },
                          {
                            name: '部分的',
                            value: report.languageProgress.reduce((sum, p) => sum + p.partialKeys, 0)
                          },
                          {
                            name: '欠落',
                            value: report.languageProgress.reduce((sum, p) => sum + p.missingKeys, 0)
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer> */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-4">
              {report.languageProgress.map((progress) => (
                <Card key={progress.language}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">{progress.language.toUpperCase()}</Badge>
                        言語進捗詳細
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        最終更新: {progress.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{progress.completedKeys}</div>
                        <p className="text-muted-foreground text-sm">完了</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{progress.partialKeys}</div>
                        <p className="text-muted-foreground text-sm">部分的</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{progress.missingKeys}</div>
                        <p className="text-muted-foreground text-sm">欠落</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{progress.reviewedKeys}</div>
                        <p className="text-muted-foreground text-sm">レビュー済み</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{progress.pendingReviewKeys}</div>
                        <p className="text-muted-foreground text-sm">レビュー待ち</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>完了率</span>
                        <span>{progress.completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress.completionRate} />
                      <div className="flex items-center justify-between text-sm">
                        <span>レビュー率</span>
                        <span>{progress.reviewRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress.reviewRate} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="missing">
            <div className="space-y-4">
              {Object.entries(report.missingTranslations).map(([language, keys]) => (
                <Card key={language}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">{language.toUpperCase()}</Badge>
                      欠落している翻訳 ({keys.length}件)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {keys.length === 0 ? (
                      <div className="text-muted-foreground py-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                        すべての翻訳が完了しています
                      </div>
                    ) : (
                      <div className="max-h-60 space-y-2 overflow-y-auto">
                        {keys.slice(0, 20).map((key) => (
                          <div key={key.key} className="flex items-center justify-between rounded border p-2">
                            <div>
                              <code className="font-mono text-sm">{key.key}</code>
                              <div className="text-muted-foreground text-xs">{key.path.join(' → ')}</div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-1 h-3 w-3" />
                              翻訳
                            </Button>
                          </div>
                        ))}
                        {keys.length > 20 && (
                          <p className="text-muted-foreground text-center text-sm">他 {keys.length - 20} 件...</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="space-y-4">
              {Object.entries(report.reviewQueue).map(([language, keys]) => (
                <Card key={language}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">{language.toUpperCase()}</Badge>
                      レビュー待ち ({keys.length}件)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {keys.length === 0 ? (
                      <div className="text-muted-foreground py-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                        レビュー待ちの項目はありません
                      </div>
                    ) : (
                      <div className="max-h-60 space-y-2 overflow-y-auto">
                        {keys.slice(0, 10).map((key) => (
                          <div key={key.key} className="flex items-center justify-between rounded border p-2">
                            <div className="flex-1">
                              <code className="font-mono text-sm">{key.key}</code>
                              <div className="text-muted-foreground text-xs">{key.value}</div>
                              <Badge
                                variant={key.reviewStatus === 'needs_review' ? 'destructive' : 'secondary'}
                                className="mt-1 text-xs"
                              >
                                {key.reviewStatus}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-3 w-3" />
                                レビュー
                              </Button>
                            </div>
                          </div>
                        ))}
                        {keys.length > 10 && (
                          <p className="text-muted-foreground text-center text-sm">他 {keys.length - 10} 件...</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            {health ? (
              <div className="space-y-4">
                {health.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        推奨事項
                      </CardTitle>
                      <CardDescription>翻訳プロセス改善のための提案</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {health.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>翻訳効率化のベストプラクティス</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-medium">自動化ツール</h4>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• DeepL API / Google Translate API</li>
                          <li>• 翻訳管理システム (Crowdin, Lokalise)</li>
                          <li>• 自動翻訳キー検出</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-medium">品質管理</h4>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• ネイティブレビュアーによる校正</li>
                          <li>• A/Bテストでの文言検証</li>
                          <li>• 継続的なフィードバック収集</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// モックデータ（開発用）
const mockTranslationReport: TranslationReport = {
  overview: {
    supportedLanguages: ['en', 'ja'],
    totalKeys: 245,
    globalCompletionRate: 87.5,
  },
  languageProgress: [
    {
      language: 'en',
      totalKeys: 245,
      completedKeys: 245,
      partialKeys: 0,
      missingKeys: 0,
      reviewedKeys: 230,
      pendingReviewKeys: 15,
      completionRate: 100,
      reviewRate: 93.9,
      lastUpdated: new Date(),
    },
    {
      language: 'ja',
      totalKeys: 245,
      completedKeys: 190,
      partialKeys: 25,
      missingKeys: 30,
      reviewedKeys: 165,
      pendingReviewKeys: 50,
      completionRate: 77.6,
      reviewRate: 67.3,
      lastUpdated: new Date(),
    },
  ],
  missingTranslations: {
    ja: [
      {
        key: 'features.calendar.advanced.title',
        path: ['features', 'calendar', 'advanced', 'title'],
        value: '',
        status: 'missing',
        reviewStatus: 'needs_review',
      },
    ],
  },
  reviewQueue: {
    ja: [
      {
        key: 'notifications.email.template.subject',
        path: ['notifications', 'email', 'template', 'subject'],
        value: 'BoxLogからの通知',
        status: 'complete',
        reviewStatus: 'pending',
      },
    ],
  },
  recentChanges: {
    en: [],
    ja: [],
  },
}

const mockTranslationHealth: TranslationHealth = {
  warnings: ['ja: 完了率が77.6%と低く、30個のキーが欠落しています', 'ja: 50個のキーがレビュー待ちです'],
  errors: [],
  recommendations: [
    '自動翻訳ツール（DeepL API等）の活用を検討してください',
    '翻訳管理システム（Crowdin、Lokalise等）の導入を検討してください',
  ],
}
