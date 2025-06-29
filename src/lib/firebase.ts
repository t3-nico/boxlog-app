import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export function initFirebase() {
  console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId ? '***' : 'MISSING'
  })
  
  if (!getApps().length) {
    console.log('Initializing new Firebase app...')
    const app = initializeApp(firebaseConfig)
    
    // Analyticsの初期化（ブラウザ環境でのみ）
    if (typeof window !== 'undefined') {
      try {
        getAnalytics(app)
        console.log('Analytics initialized')
      } catch (error) {
        console.warn('Analytics initialization failed:', error)
      }
    }
    
    console.log('Firebase app initialized successfully')
    return app
  }
  
  console.log('Firebase app already exists, returning existing app')
  return getApps()[0]
}

export { getAuth }
