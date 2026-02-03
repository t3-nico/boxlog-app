'use client';

import { FeatureErrorBoundary } from '@/components/error-boundary';
import { CalendarController } from '@/features/calendar/components/CalendarController';
import type { CalendarViewType } from '@/features/calendar/types/calendar.types';

interface CalendarViewClientProps {
  view: CalendarViewType;
  initialDate: Date | null;
  translations: {
    errorTitle: string;
    errorMessage: string;
    reloadButton: string;
  };
}

export function CalendarViewClient({ view, initialDate, translations }: CalendarViewClientProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FeatureErrorBoundary
        featureName="calendar"
        fallback={
          <div className="flex h-full items-center justify-center p-4">
            <div className="border-destructive bg-destructive-container max-w-md rounded-2xl border p-6">
              <div className="text-center">
                <div className="mb-4 text-6xl">📅</div>
                <h2 className="text-destructive mb-2 text-2xl font-bold tracking-tight">
                  {translations.errorTitle}
                </h2>
                <p className="text-foreground/80 mb-4 text-sm">{translations.errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground rounded px-4 py-2 transition-opacity hover:opacity-80"
                >
                  {translations.reloadButton}
                </button>
              </div>
            </div>
          </div>
        }
      >
        <CalendarController initialViewType={view} initialDate={initialDate} />
      </FeatureErrorBoundary>
    </div>
  );
}
