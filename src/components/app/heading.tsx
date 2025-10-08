import { cn } from '@/lib/utils'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-4xl font-bold tracking-tight'
      case 2:
        return 'text-3xl font-bold tracking-tight'
      case 3:
        return 'text-2xl font-semibold'
      case 4:
        return 'text-lg font-semibold'
      case 5:
        return 'text-base font-semibold'
      case 6:
        return 'text-sm font-semibold'
      default:
        return 'text-4xl font-bold tracking-tight'
    }
  }

  return (
    <Element {...props} className={cn(className, getHeadingClass(level), 'text-neutral-900 dark:text-neutral-100')} />
  )
}

export const Subheading = ({ className, level = 2, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={cn(className, 'text-base font-semibold text-neutral-900 sm:text-sm dark:text-neutral-100')}
    />
  )
}
