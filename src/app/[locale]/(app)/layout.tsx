import { BaseLayout } from '@/components/base-layout'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return <BaseLayout>{children}</BaseLayout>
}

export default AppLayout
