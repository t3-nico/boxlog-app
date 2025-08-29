// Re-export everything
export * from './types';
export * from './use-calendar-toast';
export * from './templates';
export * from './network-handler';
export * from './optimistic-utils';
export * from './debounced-toast';

// デフォルトエクスポート
export { useCalendarToast as default } from './use-calendar-toast';

// 使用例
// import useCalendarToast from '@/features/calendar/lib/toast';
// const toast = useCalendarToast();
// toast.eventCreated(event);