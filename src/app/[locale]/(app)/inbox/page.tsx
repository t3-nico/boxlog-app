import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Inboxルートページ
 *
 * /inbox/plan にリダイレクト
 * 将来的に /inbox/record を追加しやすい構造
 */
export default async function InboxPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/inbox/plan`);
}
