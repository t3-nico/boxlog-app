import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SpinnerProps extends Omit<React.ComponentProps<'svg'>, 'aria-label'> {
  'aria-label'?: string;
}

function Spinner({ className, 'aria-label': ariaLabel, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? 'Loading'}
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

export { Spinner };
