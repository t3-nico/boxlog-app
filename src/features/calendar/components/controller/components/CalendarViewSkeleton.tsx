'use client'

// ローディングフォールバック
export function CalendarViewSkeleton() {
  return (
    <div className="h-full w-full animate-pulse">
      <div className="bg-muted mb-4 h-12 rounded" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 rounded" />
        ))}
      </div>
    </div>
  )
}
