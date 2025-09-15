'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

const SettingsIndexPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/settings/account')
  }, [router])

  return null
}

export default SettingsIndexPage

