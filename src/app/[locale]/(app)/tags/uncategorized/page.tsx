import { UncategorizedPageClient } from './uncategorized-page-client'

interface UncategorizedPageProps {
  params: {
    locale: string
  }
}

export default function UncategorizedPage({ params }: UncategorizedPageProps) {
  return <UncategorizedPageClient />
}
