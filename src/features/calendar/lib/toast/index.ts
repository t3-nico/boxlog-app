// Re-export everything
export * from './debounced-toast'
export * from './network-handler'
export * from './optimistic-utils'
export * from './templates'
export * from './types'
export * from './use-calendar-toast'

// デフォルトエクスポート
export { useCalendarToast as default } from './use-calendar-toast'

// 使用例
// import useCalendarToast from '@/features/calendar/lib/toast';
// const toast = useCalendarToast();
// toast.eventCreated(event);
