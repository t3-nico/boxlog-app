import React from 'react'
import { X, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationItem {
  id: string
  eventId: string
  title: string
  message: string
  timestamp: Date
}

interface NotificationDisplayProps {
  notifications: NotificationItem[]
  onDismiss: (id: string) => void
  onClearAll: () => void
}

export const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  notifications,
  onDismiss,
  onClearAll
}) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Clear All Button */}
      {notifications.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="ml-auto block text-xs bg-background/80 backdrop-blur-sm border"
        >
          すべてクリア
        </Button>
      )}
      
      {/* Notification Items */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-5"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}