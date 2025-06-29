import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyB1TjmUqD3jNMsG0GruGwWfTQArbrLITg0",
  authDomain: "t3nico.firebaseapp.com",
  projectId: "t3nico",
  storageBucket: "t3nico.firebasestorage.app",
  messagingSenderId: "739209088754",
  appId: "1:739209088754:web:4ab77d5a7a24ad49d34a6b",
  measurementId: "G-TNR5YNJT56"
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
