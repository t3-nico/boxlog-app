import { BaseLayout } from '@/components/layout/base-layout'
import { TicketInspector } from '@/features/tickets/components/TicketInspector'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseLayout>
      {children}
      <TicketInspector />
    </BaseLayout>
  )
}

export default AppLayout
