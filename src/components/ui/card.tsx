import clsx from 'clsx'
import React, { forwardRef } from 'react'

export const Card = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800',
        className
      )}
      {...props}
    />
  )
})

export const CardContent = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={clsx('p-6', className)} {...props} />
})

export const CardFooter = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function CardFooter(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
})
