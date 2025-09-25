/**
 * 📊 BoxLog Analytics
 *
 * 統一されたアナリティクスシステムのエントリーポイント
 */

// Core exports
export { ANALYTICS_EVENTS, EVENT_CATEGORIES } from './events'
export type {
  AnalyticsEventName,
  BaseEventProperties,
  BusinessEventProperties,
  EngagementEventProperties,
  ErrorEventProperties,
  EventProperties,
  FeatureEventProperties,
  NavigationEventProperties,
  PerformanceEventProperties,
  UserEventProperties,
} from './events'

export { getAllEventNames, getEventCategory, getEventStats, validateEventName } from './events'

// Tracker exports
export { AnalyticsTracker, analytics, flushEvents, setUserConsent, setUserId, trackEvent } from './tracker'
export type { AnalyticsProvider } from './tracker'

// Hooks exports
export {
  useABTestTracking,
  useAnalytics,
  useClickTracking,
  useDeviceTracking,
  useErrorTracking,
  useFeatureTracking,
  useFormTracking,
  usePageView,
  usePerformanceTracking,
  useSearchTracking,
  useSessionTracking,
  useTimeTracking,
} from './hooks'

// Re-export for convenience
export default {
  events: ANALYTICS_EVENTS,
  track: trackEvent,
  setUserConsent,
  setUserId,
  flush: flushEvents,
}
