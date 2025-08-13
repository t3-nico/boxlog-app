// Settings-related types

export interface CalendarSettings {
  timezone: string
  weekStartDay: number
  timeFormat: '12h' | '24h'
  defaultView: 'month' | 'week' | 'day'
  showWeekends: boolean
  showAllDayEvents: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  reminderMinutes: number[]
  weeklyDigest: boolean
}

export interface PreferencesSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  chronotype: 'morning' | 'evening' | 'intermediate'
  dateFormat: string
}

export interface IntegrationSettings {
  googleCalendar: boolean
  outlook: boolean
  slack: boolean
  zapier: boolean
}

export interface SettingsSection {
  id: string
  title: string
  description?: string
  icon?: string
  href: string
}