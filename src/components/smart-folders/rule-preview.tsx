'use client'

import { useMemo } from 'react'
import { SmartFolderRule } from '@/types/smart-folders'
import { AdvancedRuleEngine } from '@/lib/smart-folders/rule-engine'
import { 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Filter as FunnelIcon,
  BarChart3 as ChartBarIcon
} from 'lucide-react'

interface RulePreviewProps {
  rules: SmartFolderRule[]
  items: any[]
}

interface PreviewStats {
  totalItems: number
  matchingItems: number
  matchPercentage: number
  matchingItemsList: any[]
}

export function RulePreview({ rules, items }: RulePreviewProps) {
  // リアルタイムフィルタリング結果
  const previewStats: PreviewStats = useMemo(() => {
    if (rules.length === 0) {
      return {
        totalItems: items.length,
        matchingItems: items.length,
        matchPercentage: 100,
        matchingItemsList: items
      }
    }

    const matchingItems = items.filter(item => 
      AdvancedRuleEngine.evaluateRuleSet(item, rules)
    )

    return {
      totalItems: items.length,
      matchingItems: matchingItems.length,
      matchPercentage: items.length > 0 ? Math.round((matchingItems.length / items.length) * 100) : 0,
      matchingItemsList: matchingItems.slice(0, 10) // 最大10件表示
    }
  }, [rules, items])

  // ルールの説明文を生成
  const generateRuleDescription = (rule: SmartFolderRule): string => {
    const fieldLabels: Record<string, string> = {
      tag: 'Tags',
      title: 'Title',
      description: 'Description',
      status: 'Status',
      priority: 'Priority',
      is_favorite: 'Favorite',
      created_date: 'Created Date',
      updated_date: 'Updated Date',
      due_date: 'Due Date'
    }

    const operatorLabels: Record<string, string> = {
      contains: 'contains',
      not_contains: 'does not contain',
      equals: 'equals',
      not_equals: 'does not equal',
      starts_with: 'starts with',
      ends_with: 'ends with',
      greater_than: 'is greater than',
      less_than: 'is less than',
      greater_equal: 'is greater than or equal to',
      less_equal: 'is less than or equal to',
      is_empty: 'is empty',
      is_not_empty: 'is not empty'
    }

    const field = fieldLabels[rule.field] || rule.field
    const operator = operatorLabels[rule.operator] || rule.operator
    const value = rule.value !== null && rule.value !== undefined ? String(rule.value) : ''

    if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
      return `${field} ${operator}`
    }

    return `${field} ${operator} "${value}"`
  }

  // ステータスアイコンとテキスト
  const getStatusInfo = () => {
    if (rules.length === 0) {
      return {
        icon: ExclamationTriangleIcon,
        text: 'No Rules',
        description: 'All items will be included',
        color: 'text-yellow-500'
      }
    }

    if (previewStats.matchingItems === 0) {
      return {
        icon: XCircleIcon,
        text: 'No Matches',
        description: 'Consider adjusting your rules',
        color: 'text-red-500'
      }
    }

    return {
      icon: CheckCircleIcon,
      text: 'Rules Active',
      description: `${previewStats.matchingItems} item${previewStats.matchingItems !== 1 ? 's' : ''} match`,
      color: 'text-green-500'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" data-slot="icon" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Preview
          </h3>
        </div>
        
        {/* ステータス */}
        <div className="flex items-center gap-2">
          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {statusInfo.description}
        </p>
      </div>

      {/* 統計情報 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <ChartBarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" data-slot="icon" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Statistics
          </span>
        </div>
        
        <div className="space-y-3">
          {/* マッチ数 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Matching</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {previewStats.matchingItems} / {previewStats.totalItems}
            </span>
          </div>
          
          {/* パーセンテージバー */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Match Rate</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {previewStats.matchPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${previewStats.matchPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ルール一覧 */}
      {rules.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
            Active Rules ({rules.length})
          </h4>
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={index} className="text-xs">
                {index > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.logic === 'AND' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {rule.logic}
                    </span>
                  </div>
                )}
                <div className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded p-2">
                  {generateRuleDescription(rule)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* マッチするアイテムのプレビュー */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sample Results ({Math.min(previewStats.matchingItems, 10)})
          </h4>
          
          {previewStats.matchingItemsList.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {previewStats.matchingItemsList.map((item, index) => (
                <div 
                  key={item.id || index}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                >
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {item.title || item.name || `Item ${index + 1}`}
                  </div>
                  {item.status && (
                    <div className="text-gray-500 dark:text-gray-400 mt-1">
                      Status: {item.status}
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {previewStats.matchingItems > 10 && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                  ... and {previewStats.matchingItems - 10} more items
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" data-slot="icon" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No items match your current rules
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}