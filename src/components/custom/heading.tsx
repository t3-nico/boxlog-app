import clsx from 'clsx'

import { colors, typography } from '@/config/theme'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export function Heading({ className, level = 1, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1: return typography.heading.h1
      case 2: return typography.heading.h2
      case 3: return typography.heading.h3
      case 4: return typography.heading.h4
      case 5: return typography.heading.h5
      case 6: return typography.heading.h6
      default: return typography.heading.h1
    }
  }

  return (
    <Element
      {...props}
      className={clsx(className, getHeadingClass(level), colors.text.primary)}
    />
  )
}

export function Subheading({ className, level = 2, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(className, `${typography.body.large} ${typography.body.semibold} ${colors.text.primary} sm:${typography.body.small}`)}
    />
  )
}
