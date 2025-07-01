'use client'
import clsx from 'clsx'
import { useEffect } from 'react'

export function Toast({ message, show, onClose }: { message: string; show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [show, onClose])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={clsx(
        'fixed bottom-4 right-4 z-50 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white shadow transition-opacity',
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {message}
    </div>
  )
}
