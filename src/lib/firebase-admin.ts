import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export function initAdmin() {
  if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccount) {
      initializeApp({ credential: cert(JSON.parse(serviceAccount)) })
    } else {
      initializeApp()
    }
  }
}

export { getAuth }
