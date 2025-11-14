import { redirect } from 'next/navigation'

interface InboxPageProps {
  params: Promise<{
    locale: string
  }>
}

/**
 * Inbox Root Page
 *
 * /inbox へのアクセスは /inbox/all へリダイレクト
 */
export default async function InboxPage({ params }: InboxPageProps) {
  const { locale } = await params
  redirect(`/${locale}/inbox/all`)
}
