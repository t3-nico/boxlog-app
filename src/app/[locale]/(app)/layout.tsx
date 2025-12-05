import { BaseLayout } from '@/components/layout/base-layout'
import { Toaster } from '@/components/ui/sonner'
import { SessionMonitorProvider } from '@/features/auth/components/SessionMonitorProvider'
import { PlanInspector } from '@/features/plans/components'
import { TagInspector } from '@/features/tags/components/inspector'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionMonitorProvider>
      <BaseLayout>
        {children}
        <PlanInspector />
        <TagInspector />
        <Toaster />
      </BaseLayout>
    </SessionMonitorProvider>
  )
}

export default AppLayout
