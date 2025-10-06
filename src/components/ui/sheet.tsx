"use client"

import * as React from "react"

import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = ({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) => {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

const SheetTrigger = ({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) => {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

const SheetClose = ({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) => {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

const SheetPortal = ({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) => {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

const SheetOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) => {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

const SheetContent = ({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-white shadow-lg transition ease-in-out',
          'dark:bg-neutral-900',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 border-l border-neutral-200 dark:border-neutral-800 sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 border-r border-neutral-200 dark:border-neutral-800 sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          side === 'top' &&
            'inset-x-0 top-0 h-auto border-b border-neutral-200 dark:border-neutral-800 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 h-auto border-t border-neutral-200 dark:border-neutral-800 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className={cn(
            'absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100',
            'focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:pointer-events-none',
            'data-[state=open]:bg-neutral-300 dark:data-[state=open]:bg-neutral-700'
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

const SheetTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) => {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

const SheetDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) => {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
