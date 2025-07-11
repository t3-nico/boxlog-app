/**
 * Life Counter utilities for calculating remaining days until age 100
 */

export interface LifeCounterSettings {
  enabled: boolean
  birthDate: string | null
}

export interface LifeCounterData {
  remainingDays: number
  totalDays: number
  passedDays: number
  age: number
  isOverLifeExpectancy: boolean
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay)
}

/**
 * Calculate the date when the person turns 100
 */
function get100thBirthday(birthDate: Date): Date {
  const birthday = new Date(birthDate)
  birthday.setFullYear(birthday.getFullYear() + 100)
  return birthday
}

/**
 * Calculate current age
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Calculate life counter data based on birth date
 */
export function calculateLifeCounter(birthDate: string): LifeCounterData {
  const birth = new Date(birthDate)
  const today = new Date()
  const targetDate = get100thBirthday(birth)
  
  const age = calculateAge(birth)
  const isOverLifeExpectancy = age >= 100
  
  if (isOverLifeExpectancy) {
    return {
      remainingDays: 0,
      totalDays: daysBetween(birth, targetDate),
      passedDays: daysBetween(birth, today),
      age,
      isOverLifeExpectancy: true
    }
  }
  
  const remainingDays = daysBetween(today, targetDate)
  const totalDays = daysBetween(birth, targetDate)
  const passedDays = totalDays - remainingDays
  
  return {
    remainingDays: Math.max(0, remainingDays),
    totalDays,
    passedDays,
    age,
    isOverLifeExpectancy: false
  }
}

/**
 * Format remaining days for display
 */
export function formatRemainingDays(remainingDays: number): string {
  if (remainingDays <= 0) {
    return '人生を謳歌中'
  }
  
  return `${remainingDays.toLocaleString()}日`
}

/**
 * Validate birth date
 */
export function validateBirthDate(birthDate: string): { isValid: boolean; error?: string } {
  if (!birthDate) {
    return { isValid: false, error: 'Birth date is required' }
  }
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  if (isNaN(birth.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  if (birth > today) {
    return { isValid: false, error: 'Birth date cannot be in the future' }
  }
  
  const age = calculateAge(birth)
  if (age < 0 || age > 150) {
    return { isValid: false, error: 'Invalid age range' }
  }
  
  return { isValid: true }
}

/**
 * Default life counter settings
 */
export const defaultLifeCounterSettings: LifeCounterSettings = {
  enabled: false,
  birthDate: null
}

/**
 * Load life counter settings from localStorage with fallback to sessionStorage
 */
export function loadLifeCounterSettings(): LifeCounterSettings {
  if (typeof window === 'undefined') {
    return defaultLifeCounterSettings
  }
  
  // Try localStorage first
  try {
    const stored = localStorage.getItem('life-counter-settings')
    if (stored && stored !== 'undefined') {
      const parsed = JSON.parse(stored)
      
      // Validate the loaded data structure
      if (parsed && typeof parsed === 'object') {
        const settings = {
          enabled: Boolean(parsed.enabled),
          birthDate: parsed.birthDate || null
        }
        
        // Also save to sessionStorage as backup
        try {
          sessionStorage.setItem('life-counter-settings-backup', JSON.stringify(settings))
        } catch (sessionError) {
          console.warn('Failed to save to sessionStorage backup:', sessionError)
        }
        
        return settings
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    
    // Try sessionStorage backup
    try {
      const backup = sessionStorage.getItem('life-counter-settings-backup')
      if (backup && backup !== 'undefined') {
        const parsed = JSON.parse(backup)
        if (parsed && typeof parsed === 'object') {
          return {
            enabled: Boolean(parsed.enabled),
            birthDate: parsed.birthDate || null
          }
        }
      }
    } catch (backupError) {
      console.error('Failed to load from sessionStorage backup:', backupError)
    }
    
    // Clear corrupted data
    localStorage.removeItem('life-counter-settings')
    sessionStorage.removeItem('life-counter-settings-backup')
  }
  
  return defaultLifeCounterSettings
}

/**
 * Save life counter settings to localStorage with sessionStorage backup
 */
export function saveLifeCounterSettings(settings: LifeCounterSettings): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    // Validate settings before saving
    const validatedSettings: LifeCounterSettings = {
      enabled: Boolean(settings.enabled),
      birthDate: settings.birthDate || null
    }
    
    const serialized = JSON.stringify(validatedSettings)
    
    // Save to localStorage
    localStorage.setItem('life-counter-settings', serialized)
    
    // Also save to sessionStorage as backup
    try {
      sessionStorage.setItem('life-counter-settings-backup', serialized)
    } catch (sessionError) {
      console.warn('Failed to save sessionStorage backup:', sessionError)
    }
    
    // Dispatch custom event to notify other components in the same tab
    window.dispatchEvent(new CustomEvent('life-counter-settings-changed', {
      detail: validatedSettings
    }))
  } catch (error) {
    console.error('Failed to save life counter settings:', error)
    
    // Fallback: try to clear and retry
    try {
      // Clear some space
      localStorage.removeItem('life-counter-settings')
      
      // Try to save again
      const fallbackSerialized = JSON.stringify({
        enabled: Boolean(settings.enabled),
        birthDate: settings.birthDate || null
      })
      localStorage.setItem('life-counter-settings', fallbackSerialized)
      
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError)
      
      // Last resort: at least try sessionStorage
      try {
        sessionStorage.setItem('life-counter-settings-backup', JSON.stringify(settings))
      } catch (sessionFallbackError) {
        console.error('All storage methods failed:', sessionFallbackError)
      }
    }
  }
}

/**
 * Debug helper: Get current localStorage value
 */
export function getLifeCounterDebugInfo(): {
  rawValue: string | null
  parsedValue: any
  isValid: boolean
  currentSettings: LifeCounterSettings
} {
  if (typeof window === 'undefined') {
    return {
      rawValue: null,
      parsedValue: null,
      isValid: false,
      currentSettings: defaultLifeCounterSettings
    }
  }

  const rawValue = localStorage.getItem('life-counter-settings')
  let parsedValue = null
  let isValid = false

  try {
    if (rawValue) {
      parsedValue = JSON.parse(rawValue)
      isValid = parsedValue && typeof parsedValue === 'object' && 
                'enabled' in parsedValue && 'birthDate' in parsedValue
    }
  } catch (error) {
    // Invalid JSON
  }

  return {
    rawValue,
    parsedValue,
    isValid,
    currentSettings: loadLifeCounterSettings()
  }
}