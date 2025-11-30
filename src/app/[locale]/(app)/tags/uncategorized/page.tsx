import { UncategorizedPageClient } from './uncategorized-page-client'

interface UncategorizedPageProps {
  params: {
    locale: string
  }
}

export default function UncategorizedPage({ params: _params }: UncategorizedPageProps) {
  return <UncategorizedPageClient />
}
