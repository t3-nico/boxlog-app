'use client'

import { BarChart3 } from 'lucide-react'

import { Heading } from '@/components/custom'
import { colors, typography, spacing, rounded, layout } from '@/config/theme'
import { useChatContext } from '@/contexts/chat-context'

const StatsPage = () => {
  const { state } = useChatContext()

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 ${spacing.page.default} transition-all duration-300 ${state.isOpen ? layout.chat.offset : ''}`}>
        <div className={`mx-auto ${layout.container.xl}`}>
          <Heading>Stats View</Heading>
          <div className={`${spacing.margin.xl} flex items-center justify-center h-64 ${colors.background.subtle} ${rounded.component.card.lg} border-2 border-dashed ${colors.border.subtle}`}>
            <div className="text-center">
              <BarChart3 className={`mx-auto h-12 w-12 ${colors.text.tertiary}`} />
              <h3 className={`${spacing.margin.xs} ${typography.body.sm} ${typography.weight.medium} ${colors.text.primary}`}>Statistics view coming soon</h3>
              <p className={`${spacing.margin.xs} ${typography.body.sm} ${colors.text.secondary}`}>
                This feature is under development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPage