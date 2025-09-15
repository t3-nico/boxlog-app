// Temporary data module
// TODO: Replace with proper data implementation

export interface Country {
  code: string
  name: string
  flag: string
}

// Temporary mock data
export function getCountries(): Country[] {
  return [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  ]
}

// Add other data functions as needed
export function getEvents() {
  return []
}

export function getReviews() {
  return []
}

export function getEvent(_id: string) {
  return null
}

export function getReview(_id: string) {
  return null
}

export function getEventReviews(_id: string) {
  return []
}