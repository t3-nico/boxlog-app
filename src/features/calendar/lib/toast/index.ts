// Re-export everything
export * from './templates';
export * from './types';
export * from './useCalendarToast';

// デフォルトエクスポート
export { useCalendarToast as default } from './useCalendarToast';

// 使用例
// import useCalendarToast from '@/features/calendar/lib/toast';
// const toast = useCalendarToast();
// toast.eventCreated(event);
