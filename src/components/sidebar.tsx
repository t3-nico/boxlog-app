'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { LayoutGroup, motion } from 'framer-motion'
import React, { forwardRef, useId } from 'react'
import { TouchTarget } from './touch-target'
import { Link } from './link'

export function Sidebar({
  collapsed = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'> & { collapsed?: boolean }) {
  return (
    <nav
      {...props}
      data-collapsed={collapsed ? 'true' : undefined}
      className={clsx(className, 'group flex h-full min-h-0 flex-col bg-sidebar border-r border-sidebar-border')}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col px-4 pt-4 pb-2 [&>[data-slot=section]+[data-slot=section]]:mt-3'
      )}
    />
  )
}

export function SidebarBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-1 flex-col overflow-y-auto px-4 pt-2 pb-4 [&>[data-slot=section]+[data-slot=section]]:mt-8'
      )}
    />
  )
}

export function SidebarFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col p-4 [&>[data-slot=section]+[data-slot=section]]:mt-3'
      )}
    />
  )
}

export function SidebarSection({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  let id = useId()

  return (
    <LayoutGroup id={id}>
      <div {...props} data-slot="section" className={clsx(className, 'flex flex-col gap-1')} />
    </LayoutGroup>
  )
}

export function SidebarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) {
  return <hr {...props} className={clsx(className, 'my-4 border-t border-sidebar-border lg:-mx-4')} />
}

export function SidebarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div aria-hidden="true" {...props} className={clsx(className, 'mt-8 flex-1')} />
}

export function SidebarHeading({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3 {...props} className={clsx(className, 'mb-1 px-2 text-xs/6 font-medium text-sidebar-foreground/70')} />
  )
}

export const SidebarItem = forwardRef(function SidebarItem(
  {
    current,
    indicator = true,
    className,
    children,
    ...props
  }: {
    current?: boolean
    indicator?: boolean
    className?: string
    children: React.ReactNode
  } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<Headless.ButtonProps<typeof Link>, 'as' | 'className'>
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  let currentClasses = clsx(
    'data-current:bg-sidebar-accent data-current:*:data-[slot=icon]:text-sidebar-accent-foreground'
  )

  let classes = clsx(
    // Base
    'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-base/6 font-medium text-sidebar-foreground sm:py-2 sm:text-sm/5',
    'group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2',
    // Leading icon/icon-only
    '*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-sidebar-foreground/70 sm:*:data-[slot=icon]:size-5',
    // Trailing icon (down chevron or similar)
    '*:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4',
    // Avatar
    '*:data-[slot=avatar]:-m-1 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6',
    // Hover
    'data-hover:bg-sidebar-accent data-hover:*:data-[slot=icon]:text-sidebar-accent-foreground',
    // Active
    'data-active:bg-sidebar-accent/50 data-active:*:data-[slot=icon]:text-sidebar-accent-foreground',
    currentClasses
  )

  return (
    <span className={clsx(className, 'relative')}>
      {/* Remove vertical line indicator */}
      {'href' in props ? (
        <Headless.CloseButton
          as={Link}
          {...props}
          className={classes}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.CloseButton>
      ) : (
        <Headless.Button
          {...props}
          className={clsx('cursor-default', classes)}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.Button>
      )}
    </span>
  )
})

export function SidebarLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(className, 'truncate group-data-[collapsed=true]:hidden')}
    />
  )
}
