'use client'

import { PageHeader } from '@/components/common/PageHeader'

import { useInboxViewStore } from '../stores/useInboxViewStore'

/**
 * Inboxページヘッダー
 *
 * @deprecated PageHeader を直接使用することを推奨
 */
export function InboxPageHeader() {
  const { getActiveView } = useInboxViewStore()
  const activeView = getActiveView()

  return <PageHeader title={activeView?.name || 'Inbox'} showMobileMenu={false} className="pr-4 pl-4" />
}
