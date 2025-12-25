import { Bell, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  eventId: string;
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationDisplayProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationDisplay({
  notifications,
  onDismiss,
  onClearAll,
}: NotificationDisplayProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {/* Clear All Button */}
      {notifications.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="bg-background ml-auto block border text-xs backdrop-blur-sm"
        >
          すべてクリア
        </Button>
      )}

      {/* Notification Items */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-background border-border animate-in slide-in-from-right-5 rounded-xl border p-4 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <Bell className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium">{notification.title}</h4>
              <p className="text-muted-foreground mt-1 text-xs">{notification.message}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-6 w-6 flex-shrink-0 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
