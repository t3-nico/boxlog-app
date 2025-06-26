import type { Metadata } from 'next'
import AccountForm from './AccountForm'

export const metadata: Metadata = {
  title: 'Account',
}

export default function AccountPage() {
  return <AccountForm />
}
