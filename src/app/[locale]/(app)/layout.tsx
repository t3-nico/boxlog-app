import { BaseLayout } from '@/components/layout/base-layout'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return <BaseLayout>{children}</BaseLayout>
}

export default AppLayout
