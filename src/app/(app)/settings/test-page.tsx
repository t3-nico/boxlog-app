'use client'

import { Heading } from '@/components/heading'

export default function TestSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl p-10">
      <Heading>Settings Test</Heading>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        This is a test settings page to verify the application is working.
      </p>
    </div>
  )
}