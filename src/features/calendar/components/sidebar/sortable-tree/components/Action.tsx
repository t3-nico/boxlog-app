'use client';

import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

export interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  cursor?: 'grab' | 'pointer';
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, cursor = 'pointer', style, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded border-none bg-transparent',
          'hover:bg-muted cursor-pointer focus:outline-none',
          'transition-colors [&>svg]:flex-shrink-0',
          className,
        )}
        style={{
          cursor,
          ...style,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        {...props}
      />
    );
  },
);

Action.displayName = 'Action';
