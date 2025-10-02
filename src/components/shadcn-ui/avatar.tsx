"use client"

import * as React from "react"

import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

// Avatar Root Component
interface AvatarRootProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  initials?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarRootProps
>(({ className, src, alt, initials, children, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      {initials && <AvatarFallback>{initials}</AvatarFallback>}
      {!src && !initials && children}
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800',
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
