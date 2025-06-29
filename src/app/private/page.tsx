import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { initAdmin, getAuth } from '@/lib/firebase-admin'

export default async function PrivatePage() {
  initAdmin()
  const auth = getAuth()
  const token = cookies().get('session')?.value
  if (!token) {
    redirect('/auth')
  }
  try {
    const decoded = await auth.verifyIdToken(token!)
    return <p className="text-center mt-16 text-xl">Hello {decoded.email}</p>
  } catch {
    redirect('/auth')
  }
}
