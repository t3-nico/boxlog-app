'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
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

import { useSearchHistory } from '../hooks/use-search'
import { registerDefaultCommands } from '../lib/command-registry'
import { SearchEngine } from '../lib/search-engine'
import type { SearchResult } from '../types'

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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

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

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      const searchResults = await SearchEngine.search({ query, limit: 15 }, { plans, tags })
      setResults(searchResults)
    }

    performSearch()
  }, [query, plans, tags])

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
    if (result.icon && iconNameMap[result.icon]) {
      return iconNameMap[result.icon]
    }
    // Check category icons
    if (result.category && categoryIcons[result.category]) {
      return categoryIcons[result.category]
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
          router.push(`/inbox?plan=${planId}`)
        } else if (result.type === 'tag') {
          const tagNumber = (result.metadata as { tagNumber?: string })?.tagNumber
          if (tagNumber) {
            router.push(`/tags/${tagNumber}`)
          }
        }
      }
    },
    [query, addToHistory, router, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>グローバル検索</DialogTitle>
        </VisuallyHidden>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground !rounded-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
          <div className="relative">
            <CommandInput placeholder="検索... (コマンド、プラン、タグ)" value={query} onValueChange={setQuery} />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              <kbd className="bg-muted text-muted-foreground inline-flex h-5 items-center gap-1 rounded border px-2 font-mono text-xs font-medium opacity-100 select-none">
                ESC
              </kbd>
            </div>
          </div>
          <CommandList className="max-h-[30rem]">
            <CommandEmpty>結果が見つかりませんでした</CommandEmpty>

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
                      className="flex items-center gap-3"
                    >
                      <ResultIcon className="h-4 w-4 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{result.title}</span>
                        {result.description && (
                          <span className="text-muted-foreground truncate text-xs">{result.description}</span>
                        )}
                      </div>
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
