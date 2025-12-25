// Temporary data module
// Data implementation tracked in Issue #83

export interface Country {
  code: string;
  name: string;
  flag: string;
  regions: string[];
  flagUrl: string;
}

// Temporary mock data
export function getCountries(): Country[] {
  return [
    {
      code: 'US',
      name: 'United States',
      flag: '🇺🇸',
      regions: ['California', 'New York', 'Texas'],
      flagUrl: '/flags/us.png',
    },
    {
      code: 'JP',
      name: 'Japan',
      flag: '🇯🇵',
      regions: ['Tokyo', 'Osaka', 'Kyoto'],
      flagUrl: '/flags/jp.png',
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      flag: '🇬🇧',
      regions: ['England', 'Scotland', 'Wales'],
      flagUrl: '/flags/gb.png',
    },
    {
      code: 'DE',
      name: 'Germany',
      flag: '🇩🇪',
      regions: ['Bavaria', 'Berlin', 'Hamburg'],
      flagUrl: '/flags/de.png',
    },
    {
      code: 'FR',
      name: 'France',
      flag: '🇫🇷',
      regions: ['Paris', 'Lyon', 'Marseille'],
      flagUrl: '/flags/fr.png',
    },
    {
      code: 'CA',
      name: 'Canada',
      flag: '🇨🇦',
      regions: ['Ontario', 'Quebec', 'British Columbia'],
      flagUrl: '/flags/ca.png',
    },
    {
      code: 'AU',
      name: 'Australia',
      flag: '🇦🇺',
      regions: ['New South Wales', 'Victoria', 'Queensland'],
      flagUrl: '/flags/au.png',
    },
  ];
}

// Add other data functions as needed
export function getEvents() {
  return [];
}

export function getReviews() {
  return [];
}

export function getEvent(_id: string) {
  return null;
}

export function getReview(_id: string) {
  return null;
}

export function getEventReviews(_id: string) {
  return [];
}
