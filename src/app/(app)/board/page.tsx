import { colors, spacing, typography } from '@/config/theme'
import { patterns } from '@/config/theme/elevation'
import { layoutPatterns } from '@/config/theme/layout'
import { componentRadius } from '@/config/theme/rounded'

const BoardPage = () => {
  return (
    <div className={spacing.page.default}>
      <div className={layoutPatterns.singleColumn}>
        <div className={spacing.section.default}>
          <h1 className={typography.heading.h1}>Board View</h1>
          <p className={`${spacing.margin.sm} ${colors.text.secondary}`}>Kanban style task management</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Todo Column */}
          <div
            className={`${colors.background.elevated} ${componentRadius.card.base} ${patterns.card.default} ${spacing.padding.md}`}
          >
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>Todo</h2>
            <div className={spacing.stack.sm}>
              <div
                className={`${colors.background.subtle} ${spacing.padding.sm} ${componentRadius.card.nested} border-l-4 ${colors.border.info}`}
              >
                <h3 className={typography.body.semibold}>Sample Task 1</h3>
                <p className={`${typography.body.sm} ${colors.text.secondary}`}>Task description</p>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div
            className={`${colors.background.elevated} ${componentRadius.card.base} ${patterns.card.default} ${spacing.padding.md}`}
          >
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>In Progress</h2>
            <div className={spacing.stack.sm}>
              <div
                className={`${colors.background.subtle} ${spacing.padding.sm} ${componentRadius.card.nested} border-l-4 ${colors.border.warning}`}
              >
                <h3 className={typography.body.semibold}>Sample Task 2</h3>
                <p className={`${typography.body.sm} ${colors.text.secondary}`}>Task in progress</p>
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div
            className={`${colors.background.elevated} ${componentRadius.card.base} ${patterns.card.default} ${spacing.padding.md}`}
          >
            <h2 className={`${typography.heading.h3} ${colors.text.primary} ${spacing.margin.sm}`}>Done</h2>
            <div className={spacing.stack.sm}>
              <div
                className={`${colors.background.subtle} ${spacing.padding.sm} ${componentRadius.card.nested} border-l-4 ${colors.border.success}`}
              >
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

export default BoardPage
