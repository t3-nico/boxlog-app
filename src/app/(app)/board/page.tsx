import React from 'react'
import { colors, typography, spacing, rounded, elevation } from '@/config/theme'

export default function BoardPage() {
  return (
    <div className={spacing.page.default}>
      <div className="max-w-7xl mx-auto">
        <div className={spacing.section.default}>
          <h1 className={typography.heading.h1}>Board View</h1>
          <p className={`${spacing.margin.sm} ${colors.text.secondary}`}>
            Kanban style task management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div className={`${colors.background.elevated} ${rounded.component.card.md} ${elevation.card.default} ${spacing.padding.md}`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>Todo</h2>
            <div className={spacing.stack.sm}>
              <div className={`${colors.background.subtle} ${spacing.padding.sm} ${rounded.component.input.sm} border-l-4 ${colors.border.info}`}>
                <h3 className={typography.body.semibold}>Sample Task 1</h3>
                <p className={`${typography.body.sm} ${colors.text.secondary}`}>Task description</p>
              </div>
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className={`${colors.background.elevated} ${rounded.component.card.md} ${elevation.card.default} ${spacing.padding.md}`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>In Progress</h2>
            <div className={spacing.stack.sm}>
              <div className={`${colors.background.subtle} ${spacing.padding.sm} ${rounded.component.input.sm} border-l-4 ${colors.border.warning}`}>
                <h3 className={typography.body.semibold}>Sample Task 2</h3>
                <p className={`${typography.body.sm} ${colors.text.secondary}`}>Task in progress</p>
              </div>
            </div>
          </div>
          
          {/* Done Column */}
          <div className={`${colors.background.elevated} ${rounded.component.card.md} ${elevation.card.default} ${spacing.padding.md}`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>Done</h2>
            <div className={spacing.stack.sm}>
              <div className={`${colors.background.subtle} ${spacing.padding.sm} ${rounded.component.input.sm} border-l-4 ${colors.border.success}`}>
                <h3 className={typography.body.semibold}>Sample Task 3</h3>
                <p className={`${typography.body.sm} ${colors.text.secondary}`}>Completed task</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}