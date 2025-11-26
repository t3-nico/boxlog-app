import { BaseLayout } from '@/components/layout/base-layout'
import { Toaster } from '@/components/ui/sonner'
import { PlanInspector } from '@/features/plans/components'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseLayout>
      {children}
      <PlanInspector />
      <Toaster />
    </BaseLayout>
  )
}

export default AppLayout
