'use client'

import { useEffect } from 'react'
import { Dialog, DialogBody } from './dialog'
import { InputGroup, Input } from './input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import LogSearchResult from './LogSearchResult'
import { useLogSearch } from '@/hooks/useLogSearch'

export default function SearchModal() {
  const { open, setOpen, query, setQuery, results, loading } = useLogSearch()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setOpen])

  return (
    <Dialog open={open} onClose={setOpen} size="md">
      <DialogBody>
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            autoFocus
            placeholder="Search logs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          </div>
        ) : results.length > 0 ? (
          <ul className="mt-6 divide-y divide-zinc-950/10 dark:divide-white/10">
            {results.map((log) => (
              <LogSearchResult key={log.id} log={log} onSelect={() => setOpen(false)} />
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-center text-sm/6 text-zinc-500 dark:text-zinc-400">No logs found.</p>
        )
      </DialogBody>
    </Dialog>
  )
}
