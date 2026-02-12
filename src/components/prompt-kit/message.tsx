import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type MessageProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function Message({ children, className, ...props }: MessageProps) {
  return (
    <div className={cn('flex gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export type MessageContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function MessageContent({ children, className, ...props }: MessageContentProps) {
  return (
    <div
      className={cn(
        'bg-secondary text-foreground rounded-2xl p-3 break-words whitespace-normal',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type MessageActionsProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function MessageActions({ children, className, ...props }: MessageActionsProps) {
  return (
    <div className={cn('text-muted-foreground flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
}

export type MessageActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

function MessageAction({ tooltip, children, className, side = 'top' }: MessageActionProps) {
  return (
    <HoverTooltip content={tooltip} side={side} {...(className ? { className } : {})}>
      {children}
    </HoverTooltip>
  );
}

export { Message, MessageAction, MessageActions, MessageContent };
