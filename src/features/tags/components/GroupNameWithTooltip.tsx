'use client'

import { useEffect, useRef, useState } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface GroupNameWithTooltipProps {
  name: string
  onDoubleClick: (e: React.MouseEvent) => void
}

/**
 * グループ名表示 - 省略時のみツールチップを表示
 */
export function GroupNameWithTooltip({ name, onDoubleClick }: GroupNameWithTooltipProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }

    checkTruncation()

    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [name])

  const content = (
    <span ref={textRef} className="flex-1 truncate" onDoubleClick={onDoubleClick}>
      {name}
    </span>
  )

  if (!isTruncated) {
    return content
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          <p className="whitespace-nowrap">{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
