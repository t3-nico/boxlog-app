import { UncategorizedPageClient } from './uncategorized-page-client';

interface UncategorizedPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function UncategorizedPage({ params: _params }: UncategorizedPageProps) {
  return <UncategorizedPageClient />;
}
