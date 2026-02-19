'use client';

import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  hasRequested: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * Browser notification permission management hook
 *
 * Manages notification permission state and provides a function to request permission.
 * Reminder monitoring is handled server-side via Edge Function + Realtime subscription.
 *
 * @returns Notification permission state and request function
 *
 * @example
 * ```tsx
 * const { permission, hasRequested, requestPermission } = useNotifications();
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasRequested, setHasRequested] = useState(false);

  // Get current notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const requested = localStorage.getItem('notification-permission-requested');
      setHasRequested(requested === 'true');
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setHasRequested(true);
      localStorage.setItem('notification-permission-requested', 'true');
    } catch (error) {
      logger.error('Failed to request notification permission:', error);
    }
  }, []);

  return {
    permission,
    hasRequested,
    requestPermission,
  };
}
