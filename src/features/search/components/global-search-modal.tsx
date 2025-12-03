'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { CheckSquare, Clock, Tag } from 'lucide-react'

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
import { usePlans } from '@/features/plans/hooks'
import { useTagStore } from '@/features/tags/stores/useTagStore'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useSearchHistory } from '../hooks/use-search'
import { FuzzySearch } from '../lib/search-engine'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter()
  const { history, addToHistory } = useSearchHistory()
  const [query, setQuery] = useState('')

  // Get data from stores
  const { data: plans = [] } = usePlans()
  const tags = useTagStore((state) => state.tags)

  // Filter results based on query
  const filteredPlans = query
    ? FuzzySearch.search(
        plans.map((plan) => ({
          ...plan,
          title: plan.title,
          description: plan.description || '',
          keywords: plan.tags?.map((t) => t.name) || [],
        })),
        query,
        5
      )
    : plans.slice(0, 5)

  const filteredTags = query
    ? FuzzySearch.search(
        tags.map((tag) => ({
          ...tag,
          title: tag.name,
          description: tag.description || '',
          keywords: [tag.name, tag.path].filter(Boolean) as string[],
        })),
        query,
        5
      )
    : tags.slice(0, 5)

  // Handle result selection
  const handleSelect = useCallback(
    (callback: () => void, searchQuery?: string) => {
      if (searchQuery) {
        addToHistory(searchQuery)
      }
      callback()
      onClose()
    },
    [addToHistory, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>グローバル検索</DialogTitle>
        </VisuallyHidden>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground !rounded-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
          <CommandInput placeholder="プランやタグを検索..." value={query} onValueChange={setQuery} />
          <CommandList className="max-h-[31rem]">
            <CommandEmpty>結果が見つかりませんでした</CommandEmpty>

            {/* Recent Searches */}
            {history.length > 0 && query === '' && (
              <>
                <CommandGroup heading="最近の検索">
                  {history.slice(0, 5).map((item) => (
                    <CommandItem
                      key={`history-${item}`}
                      onSelect={() => {
                        setQuery(item)
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Plans */}
            {filteredPlans.length > 0 && (
              <CommandGroup heading="プラン">
                {filteredPlans.map((plan) => (
                  <CommandItem
                    key={plan.id}
                    value={plan.title}
                    keywords={[plan.description || '', ...(plan.tags?.map((t) => t.name) || [])]}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/inbox?plan=${plan.id}`)
                      }, query)
                    }
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{plan.title}</span>
                      {plan.description && <span className="text-muted-foreground text-xs">{plan.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tags */}
            {filteredTags.length > 0 && (
              <CommandGroup heading="タグ">
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    keywords={[tag.description || '', tag.path || '']}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/tags/${tag.tag_number}`)
                      }, query)
                    }
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{tag.name}</span>
                      {tag.description && <span className="text-muted-foreground text-xs">{tag.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
