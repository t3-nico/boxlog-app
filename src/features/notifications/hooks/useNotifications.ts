'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import { logger } from '@/lib/logger';

const STORAGE_KEY = 'notification-permission-requested';

// useSyncExternalStore用: Notification.permission を外部ストアとして購読
function subscribePermission(callback: () => void) {
  // permissionchangeイベントで権限変更を検知（Chrome対応）
  if (typeof window !== 'undefined' && 'Notification' in window && 'permissions' in navigator) {
    let cleanup = () => {};
    navigator.permissions.query({ name: 'notifications' }).then((status) => {
      status.addEventListener('change', callback);
      cleanup = () => status.removeEventListener('change', callback);
    });
    return () => cleanup();
  }
  return () => {};
}

function getPermissionSnapshot(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'default';
}

function getPermissionServerSnapshot(): NotificationPermission {
  return 'default';
}

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
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    getPermissionServerSnapshot,
  );

  // hasRequestedはlocalStorage由来の初期値（変更頻度低いためuseStateで十分）
  const [hasRequested, setHasRequested] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    try {
      await Notification.requestPermission();
      setHasRequested(true);
      localStorage.setItem(STORAGE_KEY, 'true');
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
