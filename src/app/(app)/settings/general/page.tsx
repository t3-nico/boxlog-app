import dynamic from 'next/dynamic'

import type { Metadata } from 'next'

import { Subheading } from '@/components/custom'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { Separator } from '@/components/shadcn-ui/separator'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { colors, layout, typography } from '@/config/theme'
import { SettingsLayout } from '@/features/settings/components'

const Address = dynamic(() => import('../address').then((mod) => ({ default: mod.Address })), {
  ssr: false,
  loading: () => <div className="h-20 animate-pulse rounded bg-gray-200" />,
})

export const metadata: Metadata = {
  title: 'Settings',
}

const SettingsPage = () => {
  return (
    <SettingsLayout title="一般設定" description="組織の基本情報と設定を管理します">
      <form method="post" className={layout.container.large}>
        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>Organization Name</Subheading>
            <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>
              This will be displayed on your public profile.
            </p>
          </div>
          <div>
            <Input aria-label="Organization Name" name="name" defaultValue="Catalyst" />
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>Organization Bio</Subheading>
            <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>
              This will be displayed on your public profile. Maximum 240 characters.
            </p>
          </div>
          <div>
            <Textarea aria-label="Organization Bio" name="bio" />
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>Organization Email</Subheading>
            <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>
              This is how customers can contact you for support.
            </p>
          </div>
          <div className="space-y-4">
            <Input type="email" aria-label="Organization Email" name="email" defaultValue="info@example.com" />
            <div className="flex items-center gap-2">
              <Checkbox id="email_is_public" name="email_is_public" defaultChecked />
              <Label htmlFor="email_is_public">Show email on public profile</Label>
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>Address</Subheading>
            <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>
              This is where your organization is registered.
            </p>
          </div>
          <Address />
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>Currency</Subheading>
            <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>
              The currency that your organization will be collecting.
            </p>
          </div>
          <div>
            <Select defaultValue="cad" name="currency">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="usd">USD - United States Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator className="my-8" />

        <div className="flex justify-end gap-4">
          <Button type="reset" variant="ghost">
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

export default SettingsPage
