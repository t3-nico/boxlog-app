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
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig)
    
    // Analyticsの初期化（ブラウザ環境でのみ）
    if (typeof window !== 'undefined') {
      getAnalytics(app)
    }
    
    return app
  }
  return getApps()[0]
}

export { getAuth }
