'use client';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface TimezoneOffsetProps {
  timezone: string;
  className?: string;
}

export function TimezoneOffset({ timezone, className }: TimezoneOffsetProps) {
  const router = useRouter();
  const locale = useLocale();

  const getUTCOffset = (tz: string): string => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      });
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find((part) => part.type === 'timeZoneName');

      if (offsetPart?.value) {
        const match = offsetPart.value.match(/GMT([+-]\d+)/);
        if (match && match[1]) {
          const offset = parseInt(match[1]);
          return offset >= 0 ? `+${offset}` : `${offset}`;
        }
      }

      const tzOffset = now
        .toLocaleString('en-US', {
          timeZone: tz,
          timeZoneName: 'shortOffset',
        })
        .match(/UTC([+-]\d+)/)?.[1];

      return tzOffset || '+0';
    } catch {
      return '+0';
    }
  };

  const handleClick = () => {
    router.push(`/${locale}/settings/calendar`);
  };

  const offset = getUTCOffset(timezone);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'text-muted-foreground flex items-center justify-end pr-2 text-xs',
        'hover:text-foreground cursor-pointer rounded transition-colors',
        className,
      )}
    >
      <span className="font-normal">UTC{offset}</span>
    </button>
  );
}
