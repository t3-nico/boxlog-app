// キーボードショートカットハンドラーの分離

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

export interface KeyboardShortcutCallbacks {
  onEscape?: () => void;
  onSelectPrevious?: () => void;
  onSelectNext?: () => void;
  onDeleteEvent?: (plan: CalendarPlan) => void;
  onEditEvent?: (plan: CalendarPlan) => void;
  onDuplicateEvent?: (plan: CalendarPlan) => void;
  onCopy?: (plan: CalendarPlan) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPaste?: (date: Date, time: string) => void;
  onCreateEvent?: (date: Date, time: string) => void;
  onToggleHelp?: () => void;
}

export interface KeyboardEventContext {
  event: KeyboardEvent;
  selectedEvent: CalendarPlan | null;
  debounceAction: (action: () => void, delay?: number) => void;
  callbacks: KeyboardShortcutCallbacks;
}

/**
 * 基本ナビゲーションキーの処理
 */
export const handleBasicNavigation = ({ event, callbacks }: KeyboardEventContext): boolean => {
  const { key, ctrlKey, metaKey } = event;
  const isModKey = ctrlKey || metaKey;

  switch (key) {
    case 'Escape':
      event.preventDefault();
      callbacks.onEscape?.();
      return true;

    case 'ArrowUp':
      if (!isModKey) {
        event.preventDefault();
        callbacks.onSelectPrevious?.();
        return true;
      }
      break;

    case 'ArrowDown':
      if (!isModKey) {
        event.preventDefault();
        callbacks.onSelectNext?.();
        return true;
      }
      break;
  }

  return false;
};

/**
 * 選択されたイベントに対する操作の処理
 */
export const handleSelectedEventActions = ({
  event,
  selectedEvent,
  debounceAction,
  callbacks,
}: KeyboardEventContext): boolean => {
  if (!selectedEvent) return false;

  const { key, ctrlKey, metaKey } = event;
  const isModKey = ctrlKey || metaKey;

  switch (key) {
    case 'Delete':
    case 'Backspace':
      event.preventDefault();
      debounceAction(() => callbacks.onDeleteEvent?.(selectedEvent), 0);
      return true;

    case 'Enter':
      event.preventDefault();
      debounceAction(() => callbacks.onEditEvent?.(selectedEvent), 0);
      return true;

    case 'd':
      if (isModKey) {
        event.preventDefault();
        debounceAction(() => callbacks.onDuplicateEvent?.(selectedEvent));
        return true;
      }
      break;

    case 'c':
      if (isModKey) {
        event.preventDefault();
        debounceAction(() => callbacks.onCopy?.(selectedEvent));
        return true;
      }
      break;
  }

  return false;
};

/**
 * グローバルショートカットの処理
 */
export const handleGlobalShortcuts = ({
  event,
  debounceAction,
  callbacks,
}: KeyboardEventContext): boolean => {
  const { key, ctrlKey, metaKey, shiftKey } = event;
  const isModKey = ctrlKey || metaKey;

  if (!isModKey) return false;

  switch (key) {
    case 'z':
      event.preventDefault();
      if (shiftKey) {
        debounceAction(() => callbacks.onRedo?.());
      } else {
        debounceAction(() => callbacks.onUndo?.());
      }
      return true;

    case 'v':
      event.preventDefault();
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      debounceAction(() => callbacks.onPaste?.(now, timeString));
      return true;

    case 'n':
      event.preventDefault();
      const createNow = new Date();
      const createTimeString = `${String(createNow.getHours()).padStart(2, '0')}:${String(createNow.getMinutes()).padStart(2, '0')}`;
      debounceAction(() => callbacks.onCreateEvent?.(createNow, createTimeString));
      return true;
  }

  return false;
};

/**
 * 単一キーショートカットの処理
 */
export const handleSingleKeyShortcuts = ({
  event,
  debounceAction,
  callbacks,
}: KeyboardEventContext): boolean => {
  const { key, ctrlKey, metaKey } = event;
  const isModKey = ctrlKey || metaKey;

  if (isModKey) return false;

  switch (key) {
    case 'a':
      event.preventDefault();
      const today = new Date();
      debounceAction(() => callbacks.onCreateEvent?.(today, '09:00'));
      return true;

    case 'h':
    case '?':
      event.preventDefault();
      debounceAction(() => callbacks.onToggleHelp?.());
      return true;
  }

  return false;
};
