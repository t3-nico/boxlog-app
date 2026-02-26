/**
 * Notification Service Types
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

export type ServiceSupabaseClient = SupabaseClient<Database>;

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface ListNotificationsOptions {
  userId: string;
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface CreateNotificationOptions {
  userId: string;
  type: string;
  planId: string;
}

export interface UpdateNotificationOptions {
  userId: string;
  notificationId: string;
  isRead?: boolean;
  readAt?: string | null;
}

export interface MarkAllAsReadOptions {
  userId: string;
  type?: string;
}

export interface DeleteNotificationsOptions {
  userId: string;
  ids: string[];
}
