'use client';

import { cn } from '@/lib/utils';
import React, { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import { Action } from '../Action';
import { Handle } from '../Handle';
import { Remove } from '../Remove';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref,
  ) => {
    return (
      <li
        className={cn(
          'mb-[-1px] box-border list-none',
          clone && 'pointer-events-none inline-block p-0 pt-1.5 pl-2.5',
          ghost && indicator && 'relative z-[1] mb-[-1px] opacity-100',
          disableSelection && 'select-none',
          disableInteraction && 'pointer-events-none',
        )}
        ref={wrapperRef}
        style={
          {
            paddingLeft: clone ? undefined : `${indentationWidth * depth}px`,
          } as CSSProperties
        }
        {...props}
      >
        <div
          className={cn(
            'bg-card border-border text-foreground relative box-border flex items-center border px-2.5 py-2.5',
            clone && 'rounded py-1.5 pr-6 shadow-lg',
            ghost && indicator && 'h-2 border-[#2389ff] bg-[#56a1f8] p-0',
          )}
          ref={ref}
          style={style}
        >
          {/* ghost && indicator の時は子要素を非表示 */}
          {!(ghost && indicator) && (
            <>
              <Handle {...handleProps} />
              {onCollapse && (
                <Action
                  onClick={onCollapse}
                  className={cn(
                    '[&>svg]:transition-transform [&>svg]:duration-250',
                    collapsed && '[&>svg]:-rotate-90',
                  )}
                >
                  <CollapseIcon />
                </Action>
              )}
              <span className="grow overflow-hidden pl-2 text-sm text-ellipsis whitespace-nowrap">
                {value}
              </span>
              {!clone && onRemove && <Remove onClick={onRemove} />}
              {clone && childCount && childCount > 1 ? (
                <span className="bg-primary text-primary-foreground absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                  {childCount}
                </span>
              ) : null}
            </>
          )}
        </div>
      </li>
    );
  },
);

TreeItem.displayName = 'TreeItem';

function CollapseIcon() {
  return (
    <svg width="10" viewBox="0 0 70 41" fill="currentColor">
      <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
    </svg>
  );
}
