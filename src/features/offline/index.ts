// Offline Feature Exports

// Components
export { ConflictResolutionModal } from './components';
export type { ConflictContext } from './components';

// Services
export { OfflineManager, offlineManager } from './services/offline-manager';

// Types
export type {
  ConflictDetectedEvent,
  ConflictResolution,
  ConflictResolvedEvent,
  OfflineAction,
  OfflineManagerStatus,
  SyncCompletedEvent,
  SyncFailedEvent,
  SyncResult,
} from './types';
