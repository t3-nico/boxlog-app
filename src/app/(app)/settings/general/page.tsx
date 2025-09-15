
import type { Metadata } from 'next'

import { Subheading } from '@/components/custom'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select'
import { Separator } from '@/components/shadcn-ui/separator'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { colors, typography, spacing, layout } from '@/config/theme'
import { SettingsLayout } from '@/features/settings/components'

import { Address } from '../address'

export const metadata: Metadata = {
  title: 'Settings',
}

const SettingsPage = () => {
  return (
    <SettingsLayout
      title="一般設定"
      description="組織の基本情報と設定を管理します"
    >
      <form method="post" className={layout.container.xl}>
        <Separator className={`${spacing.component.stack.xl} ${spacing.component.stack.lg}`} />

      <section className={`grid ${spacing.component.gap.xl} ${spacing.component.gap.lg} sm:grid-cols-2`}>
        <div className={spacing.component.stack.xs}>
          <Subheading>Organization Name</Subheading>
          <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>This will be displayed on your public profile.</p>
        </div>
        <div>
          <Input aria-label="Organization Name" name="name" defaultValue="Catalyst" />
        </div>
      </section>

      <Separator className={spacing.component.stack.xl} soft />

      <section className={`grid ${spacing.component.gap.xl} ${spacing.component.gap.lg} sm:grid-cols-2`}>
        <div className={spacing.component.stack.xs}>
          <Subheading>Organization Bio</Subheading>
          <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>This will be displayed on your public profile. Maximum 240 characters.</p>
        </div>
        <div>
          <Textarea aria-label="Organization Bio" name="bio" />
        </div>
      </section>

      <Separator className={spacing.component.stack.xl} soft />

      <section className={`grid ${spacing.component.gap.xl} ${spacing.component.gap.lg} sm:grid-cols-2`}>
        <div className={spacing.component.stack.xs}>
          <Subheading>Organization Email</Subheading>
          <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>This is how customers can contact you for support.</p>
        </div>
        <div className={spacing.component.stack.md}>
          <Input type="email" aria-label="Organization Email" name="email" defaultValue="info@example.com" />
          <div className={`flex items-center ${spacing.component.gap.xs}`}>
            <Checkbox id="email_is_public" name="email_is_public" defaultChecked />
            <Label htmlFor="email_is_public">Show email on public profile</Label>
          </div>
        </div>
      </section>

      <Separator className={spacing.component.stack.xl} soft />

      <section className={`grid ${spacing.component.gap.xl} ${spacing.component.gap.lg} sm:grid-cols-2`}>
        <div className={spacing.component.stack.xs}>
          <Subheading>Address</Subheading>
          <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>This is where your organization is registered.</p>
        </div>
        <Address />
      </section>

      <Separator className={spacing.component.stack.xl} soft />

      <section className={`grid ${spacing.component.gap.xl} ${spacing.component.gap.lg} sm:grid-cols-2`}>
        <div className={spacing.component.stack.xs}>
          <Subheading>Currency</Subheading>
          <p className={`${typography.body.DEFAULT} ${colors.text.secondary}`}>The currency that your organization will be collecting.</p>
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

      <Separator className={spacing.component.stack.xl} soft />

      <div className={`flex justify-end ${spacing.component.gap.md}`}>
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
