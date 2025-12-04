'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'

import {
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  Inbox,
  Moon,
  Navigation,
  Plus,
  Settings,
  Sun,
  Tag,
  Zap,
} from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useTheme } from '@/contexts/theme-context'
import { usePlans } from '@/features/plans/hooks'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore'
import { useTagStore } from '@/features/tags/stores/useTagStore'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import type { PlanStatus, PlanWithTags } from '@/features/plans/types'
import { useRecentPlans } from '../hooks/use-recent-plans'
import { useSearchHistory } from '../hooks/use-search'
import { registerDefaultCommands } from '../lib/command-registry'
import { HighlightedText } from '../lib/highlight-text'
import { getFilterHints, parseSearchQuery } from '../lib/query-parser'
import { SearchEngine } from '../lib/search-engine'
import type { SearchResult } from '../types'

// Helper function to convert plan_tags to tags format
type PlanFromAPI = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: PlanStatus
  due_date: string | null
  start_time: string | null
  end_time: string | null
  plan_number: string
  recurrence_type: string | null
  recurrence_end_date: string | null
  recurrence_rule: string | null
  reminder_minutes: number | null
  created_at: string | null
  updated_at: string | null
  plan_tags: Array<{
    tag_id: string
    tags: { id: string; name: string; color: string } | null
  }>
}

function convertPlanToSearchFormat(plans: PlanFromAPI[]): PlanWithTags[] {
  return plans.map((plan) => ({
    id: plan.id,
    user_id: plan.user_id,
    title: plan.title,
    description: plan.description,
    status: plan.status,
    due_date: plan.due_date,
    start_time: plan.start_time,
    end_time: plan.end_time,
    plan_number: plan.plan_number,
    recurrence_type: plan.recurrence_type as PlanWithTags['recurrence_type'],
    recurrence_end_date: plan.recurrence_end_date,
    recurrence_rule: plan.recurrence_rule,
    reminder_minutes: plan.reminder_minutes,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    tags:
      plan.plan_tags
        ?.map((pt) => pt.tags)
        .filter((tag): tag is { id: string; name: string; color: string } => tag !== null) || [],
  }))
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  navigation: Navigation,
  create: Plus,
  actions: Zap,
  plans: CheckSquare,
  tags: Tag,
}

// Icon name to component mapping
const iconNameMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  inbox: Inbox,
  'bar-chart': BarChart3,
  tag: Tag,
  plus: Plus,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  'check-square': CheckSquare,
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter()
  const { history, addToHistory } = useSearchHistory()
  const { recentPlans, addRecentPlan } = useRecentPlans()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  // Debounce search query (150ms delay for responsive feel)
  const debouncedQuery = useDebounce(query, 150)

  // Parse query for active filters
  const parsedQuery = useMemo(() => parseSearchQuery(query), [query])
  const filterHints = useMemo(() => getFilterHints(), [])

  // Get data from stores
  const { data: plans = [] } = usePlans()
  const tags = useTagStore((state) => state.tags)

  // Get actions from stores
  const openPlanInspector = usePlanInspectorStore((state) => state.openInspector)
  const openTagCreateModal = useTagCreateModalStore((state) => state.openModal)
  const openSettings = useSettingsDialogStore((state) => state.openSettings)
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  // Register default commands on mount
  useEffect(() => {
    registerDefaultCommands({
      router,
      openPlanInspector,
      openTagCreateModal,
      openSettings,
      toggleTheme,
    })
  }, [router, openPlanInspector, openTagCreateModal, openSettings, toggleTheme])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      // Convert plans from API format (plan_tags) to search format (tags)
      const convertedPlans = convertPlanToSearchFormat(plans as unknown as PlanFromAPI[])
      const searchResults = await SearchEngine.search(
        { query: debouncedQuery, limit: 15 },
        { plans: convertedPlans, tags }
      )
      setResults(searchResults)
    }

    performSearch()
  }, [debouncedQuery, plans, tags])

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // Group results by category/type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}

    results.forEach((result) => {
      const groupKey = result.category || result.type
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(result)
    })

    return groups
  }, [results])

  // Get group label
  const getGroupLabel = (key: string): string => {
    const labels: Record<string, string> = {
      navigation: 'ナビゲーション',
      create: '作成',
      actions: 'アクション',
      plans: 'プラン',
      tags: 'タグ',
      command: 'コマンド',
      plan: 'プラン',
      tag: 'タグ',
    }
    return labels[key] || key
  }

  // Get icon for result
  const getResultIcon = (result: SearchResult): React.ElementType => {
    // Check icon name mapping first
    if (result.icon) {
      const iconFromName = iconNameMap[result.icon]
      if (iconFromName) {
        return iconFromName
      }
    }
    // Check category icons
    if (result.category) {
      const iconFromCategory = categoryIcons[result.category]
      if (iconFromCategory) {
        return iconFromCategory
      }
    }
    // Default icon
    return CheckSquare
  }

  // Handle result selection
  const handleSelect = useCallback(
    async (result: SearchResult) => {
      if (query) {
        addToHistory(query)
      }

      onClose()

      // Execute action if available
      if (result.action) {
        await result.action()
      } else {
        // Default navigation based on type
        if (result.type === 'plan') {
          const planId = result.id.replace('plan:', '')
          addRecentPlan(planId, result.title)
          router.push(`/inbox?plan=${planId}`)
        } else if (result.type === 'tag') {
          const tagNumber = (result.metadata as { tagNumber?: string })?.tagNumber
          if (tagNumber) {
            router.push(`/tags/${tagNumber}`)
          }
        }
      }
    },
    [query, addToHistory, addRecentPlan, router, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>グローバル検索</DialogTitle>
        </VisuallyHidden>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground !rounded-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2">
          <div className="relative">
            <CommandInput placeholder="検索... (コマンド、プラン、タグ)" value={query} onValueChange={setQuery} />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              <kbd className="bg-muted text-muted-foreground inline-flex h-6 items-center gap-1 rounded border px-2 font-mono text-xs font-medium opacity-100 select-none">
                ESC
              </kbd>
            </div>
          </div>
          <CommandList className="max-h-[30rem]">
            <CommandEmpty>結果が見つかりませんでした</CommandEmpty>

            {/* Active Filters Indicator */}
            {parsedQuery.hasFilters && (
              <div className="border-border flex items-center gap-2 border-b px-4 py-2">
                <Filter className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-xs">フィルター適用中:</span>
                {parsedQuery.filters.status && (
                  <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                    status: {parsedQuery.filters.status.join(', ')}
                  </span>
                )}
                {parsedQuery.filters.tags && (
                  <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                    #{parsedQuery.filters.tags.join(', #')}
                  </span>
                )}
                {parsedQuery.filters.dueDate && (
                  <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                    due: {parsedQuery.filters.dueDate}
                  </span>
                )}
              </div>
            )}

            {/* Filter Hints (shown on empty query) */}
            {query === '' && (
              <CommandGroup heading="クイックフィルター">
                {filterHints.slice(0, 4).map((hint) => (
                  <CommandItem
                    key={hint.syntax}
                    onSelect={() => setQuery(hint.syntax + ' ')}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4 shrink-0" />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <code className="bg-muted rounded px-2 py-1 text-xs">{hint.syntax}</code>
                      <span className="text-muted-foreground text-xs">{hint.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Recent Searches */}
            {history.length > 0 && query === '' && (
              <>
                <CommandGroup heading="最近の検索">
                  {history.slice(0, 5).map((item) => (
                    <CommandItem key={`history-${item}`} onSelect={() => setQuery(item)}>
                      <Clock className="mr-2 h-4 w-4" />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Recent Plans */}
            {recentPlans.length > 0 && query === '' && (
              <>
                <CommandGroup heading="最近使ったプラン">
                  {recentPlans.map((plan) => (
                    <CommandItem
                      key={`recent-plan-${plan.id}`}
                      onSelect={() => {
                        onClose()
                        router.push(`/inbox?plan=${plan.id}`)
                      }}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {plan.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Grouped Results */}
            {Object.entries(groupedResults).map(([groupKey, groupResults]) => (
              <CommandGroup key={groupKey} heading={getGroupLabel(groupKey)}>
                {groupResults.map((result) => {
                  const ResultIcon = getResultIcon(result)

                  return (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2"
                    >
                      <ResultIcon className="h-4 w-4 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">
                          <HighlightedText text={result.title} query={query} />
                        </span>
                        {result.description && (
                          <span className="text-muted-foreground truncate text-xs">
                            <HighlightedText text={result.description} query={query} />
                          </span>
                        )}
                      </div>
                      {result.shortcut && result.shortcut.length > 0 && (
                        <div className="flex shrink-0 items-center gap-1">
                          {result.shortcut.map((key, index) => (
                            <kbd
                              key={index}
                              className="bg-muted text-muted-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-2 font-mono text-xs font-medium"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
