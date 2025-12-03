import { BaseLayout } from '@/components/layout/base-layout'
import { Toaster } from '@/components/ui/sonner'
import { PlanInspector } from '@/features/plans/components'
import { TagInspector } from '@/features/tags/components/inspector'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseLayout>
      {children}
      <PlanInspector />
      <TagInspector />
      <Toaster />
    </BaseLayout>
  )
}

export default AppLayout
