// @see Issue #621 - Events削除後、Plans/Sessionsに移行予定
'use client';

import { logger } from '@/lib/logger';

// ポップアップコンテキストの型定義
interface PopupContext {
  initialData?: Record<string, unknown>;
  source?: string;
  date?: Date;
  editingEvent?: Record<string, unknown>;
}

// Legacy hook - 新しいuseCreateModalStoreへの移行用
// Scheduled for removal - tracked in Issue #89
export function useAddPopup() {
  return {
    isOpen: false,
    openPopup: (_type: 'event' | 'log' = 'event', _context?: PopupContext) => {
      logger.debug('Plans/Sessions統合後に実装予定');
    },
    openEventPopup: (_context?: PopupContext) => {
      logger.debug('Plans/Sessions統合後に実装予定');
    },
    closePopup: () => {
      logger.debug('Plans/Sessions統合後に実装予定');
    },
  };
}
