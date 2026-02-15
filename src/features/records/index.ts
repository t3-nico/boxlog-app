/**
 * Records Feature
 *
 * 作業ログ（Record）機能のエントリポイント
 */

// Components
export { RecordInspector } from './components';

// Hooks
export { useRecentRecords, useRecordData, useRecordMutations } from './hooks';
export type { RecordItem } from './hooks';

// Stores
export { useRecordInspectorStore } from './stores';

// Types
export type { FulfillmentScore } from './types/record';
