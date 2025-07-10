'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { ConflictData } from '@/lib/offline-manager'

interface ConflictResolutionModalProps {
  isOpen: boolean
  conflict: {
    actionId: string
    entity: string
    localData: any
    serverData: any
    localTimestamp: Date
    serverTimestamp: Date
    conflicts: ConflictData[]
  }
  onResolve: (resolution: {
    choice: 'local' | 'server' | 'merge'
    mergedData?: any
  }) => void
  onCancel: () => void
}

interface FieldDifference {
  field: string
  localValue: any
  serverValue: any
  type: 'text' | 'number' | 'date' | 'boolean' | 'object'
}

export function ConflictResolutionModal({ 
  isOpen, 
  conflict, 
  onResolve, 
  onCancel 
}: ConflictResolutionModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<'local' | 'server' | 'merge'>('merge')
  const [mergedData, setMergedData] = useState<any>(null)
  const [isResolving, setIsResolving] = useState(false)

  // 差分の検出と整理
  const differences = useMemo(() => {
    const diffs: FieldDifference[] = []
    
    const compareValues = (obj1: any, obj2: any, prefix = '') => {
      Object.keys({ ...obj1, ...obj2 }).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const val1 = obj1?.[key]
        const val2 = obj2?.[key]
        
        if (val1 !== val2) {
          // 値の型を判定
          let type: FieldDifference['type'] = 'text'
          if (typeof val1 === 'number' || typeof val2 === 'number') {
            type = 'number'
          } else if (val1 instanceof Date || val2 instanceof Date) {
            type = 'date'
          } else if (typeof val1 === 'boolean' || typeof val2 === 'boolean') {
            type = 'boolean'
          } else if (typeof val1 === 'object' && typeof val2 === 'object') {
            if (val1 !== null && val2 !== null) {
              // ネストされたオブジェクトの場合は再帰的に処理
              compareValues(val1, val2, fullKey)
              return
            }
            type = 'object'
          }
          
          diffs.push({
            field: fullKey,
            localValue: val1,
            serverValue: val2,
            type
          })
        }
      })
    }
    
    compareValues(conflict.localData, conflict.serverData)
    return diffs
  }, [conflict])

  // マージデータの初期化
  useMemo(() => {
    if (!mergedData) {
      const initial = { ...conflict.localData }
      differences.forEach(diff => {
        // デフォルトではローカルの値を使用
        const keys = diff.field.split('.')
        let current = initial
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {}
          }
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = diff.localValue
      })
      setMergedData(initial)
    }
  }, [differences, mergedData, conflict.localData])

  const handleResolve = async () => {
    setIsResolving(true)
    try {
      await onResolve({
        choice: selectedChoice,
        mergedData: selectedChoice === 'merge' ? mergedData : undefined
      })
    } finally {
      setIsResolving(false)
    }
  }

  const formatValue = (value: any, type: FieldDifference['type']) => {
    if (value === null || value === undefined) return '(未設定)'
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleString('ja-JP')
      case 'boolean':
        return value ? '有効' : '無効'
      case 'object':
        return JSON.stringify(value, null, 2)
      case 'number':
        return value.toString()
      default:
        return String(value)
    }
  }

  const updateMergedValue = (field: string, value: any) => {
    const keys = field.split('.')
    const updated = { ...mergedData }
    let current = updated
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    
    setMergedData(updated)
  }

  const renderFieldEditor = (diff: FieldDifference) => {
    const currentValue = mergedData?.[diff.field] ?? diff.localValue

    switch (diff.type) {
      case 'boolean':
        return (
          <Select
            value={currentValue ? 'true' : 'false'}
            onValueChange={(value) => updateMergedValue(diff.field, value === 'true')}
            disabled={selectedChoice !== 'merge'}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">有効</SelectItem>
              <SelectItem value="false">無効</SelectItem>
            </SelectContent>
          </Select>
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => updateMergedValue(diff.field, Number(e.target.value))}
            disabled={selectedChoice !== 'merge'}
            className="w-full"
          />
        )
      
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={currentValue ? new Date(currentValue).toISOString().slice(0, 16) : ''}
            onChange={(e) => updateMergedValue(diff.field, new Date(e.target.value))}
            disabled={selectedChoice !== 'merge'}
            className="w-full"
          />
        )
      
      case 'object':
        return (
          <Textarea
            value={JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                updateMergedValue(diff.field, JSON.parse(e.target.value))
              } catch (error) {
                // JSONパースエラーは無視
              }
            }}
            disabled={selectedChoice !== 'merge'}
            className="w-full font-mono text-sm"
            rows={4}
          />
        )
      
      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => updateMergedValue(diff.field, e.target.value)}
            disabled={selectedChoice !== 'merge'}
            className="w-full"
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            同期の競合が発生しました
          </DialogTitle>
          <DialogDescription>
            オフライン中の変更とサーバーの変更が競合しています。
            どのように解決するかを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 競合の概要 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800">
                  {conflict.entity === 'task' ? 'タスク' : 
                   conflict.entity === 'record' ? '記録' : 
                   conflict.entity === 'block' ? 'ブロック' : 
                   'データ'}で競合が発生
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {differences.length}個のフィールドで違いが見つかりました
                </p>
              </div>
            </div>
          </div>

          {/* 解決方法の選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ローカルの変更を優先 */}
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedChoice === 'local' && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => setSelectedChoice('local')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  あなたの変更を優先
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <ClockIcon className="h-3 w-3" />
                  {formatDistanceToNow(conflict.localTimestamp, { 
                    addSuffix: true, 
                    locale: ja 
                  })}
                </div>
                <p className="text-sm text-gray-600">
                  オフライン中に行った変更をすべて保持します
                </p>
              </CardContent>
            </Card>

            {/* サーバーの変更を優先 */}
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedChoice === 'server' && "ring-2 ring-green-500 bg-green-50"
              )}
              onClick={() => setSelectedChoice('server')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ComputerDesktopIcon className="h-4 w-4" />
                  サーバーの変更を優先
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <ClockIcon className="h-3 w-3" />
                  {formatDistanceToNow(conflict.serverTimestamp, { 
                    addSuffix: true, 
                    locale: ja 
                  })}
                </div>
                <p className="text-sm text-gray-600">
                  サーバーの最新の変更を受け入れます
                </p>
              </CardContent>
            </Card>

            {/* 手動でマージ */}
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedChoice === 'merge' && "ring-2 ring-purple-500 bg-purple-50"
              )}
              onClick={() => setSelectedChoice('merge')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowPathIcon className="h-4 w-4" />
                  手動でマージ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">
                  各フィールドを個別に選択してマージします
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 差分の詳細表示 */}
          {differences.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">変更の詳細</h4>
              
              {selectedChoice === 'merge' ? (
                // マージモード: 各フィールドを編集可能
                <div className="space-y-4">
                  {differences.map((diff, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="mb-3">
                        <Label className="text-sm font-medium">{diff.field}</Label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">あなたの変更</Label>
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            {formatValue(diff.localValue, diff.type)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">サーバーの変更</Label>
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            {formatValue(diff.serverValue, diff.type)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">最終的な値</Label>
                          {renderFieldEditor(diff)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 比較モード: 差分を表示のみ
                <div className="space-y-3">
                  {differences.map((diff, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{diff.field}</span>
                        <Badge variant="outline" className="text-xs">
                          {diff.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn(
                          "p-3 rounded-lg border",
                          selectedChoice === 'local' ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <UserIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">あなたの変更</span>
                          </div>
                          <div className="text-sm">
                            {formatValue(diff.localValue, diff.type)}
                          </div>
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-lg border",
                          selectedChoice === 'server' ? "bg-green-50 border-green-200" : "bg-gray-50"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <ComputerDesktopIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">サーバーの変更</span>
                          </div>
                          <div className="text-sm">
                            {formatValue(diff.serverValue, diff.type)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isResolving}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving}
            className="min-w-[100px]"
          >
            {isResolving ? (
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                解決中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                この方法で解決
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}