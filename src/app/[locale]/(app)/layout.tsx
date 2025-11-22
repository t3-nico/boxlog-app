import { BaseLayout } from '@/components/layout/base-layout'
import { TicketInspector } from '@/features/plans/components'
import { Toaster } from 'sonner'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseLayout>
      {children}
      <TicketInspector />
      <Toaster position="bottom-right" richColors duration={5000} />
    </BaseLayout>
  )
}

export default AppLayout
