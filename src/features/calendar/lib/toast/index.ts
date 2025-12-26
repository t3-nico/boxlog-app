// Re-export everything
export * from './debounced-toast';
export * from './network-handler';
export * from './optimistic-utils';
export * from './templates';
export * from './types';
export * from './useCalendarToast';

// デフォルトエクスポート
export { useCalendarToast as default } from './useCalendarToast';

// 使用例
// import useCalendarToast from '@/features/calendar/lib/toast';
// const toast = useCalendarToast();
// toast.eventCreated(event);
