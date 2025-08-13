import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Separator } from '@/components/shadcn-ui/separator'
import { Label } from '@/components/custom'
import { Heading, Subheading } from '@/components/custom'
import { Input } from '@/components/shadcn-ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select'
import { Textarea } from '@/components/shadcn-ui/textarea'
import type { Metadata } from 'next'
import { Address } from '../address'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function Settings() {
  return (
    <form method="post" className="mx-auto max-w-4xl p-10">
      <Heading>Settings</Heading>
      <Separator className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Name</Subheading>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">This will be displayed on your public profile.</p>
        </div>
        <div>
          <Input aria-label="Organization Name" name="name" defaultValue="Catalyst" />
        </div>
      </section>

      <Separator className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Bio</Subheading>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">This will be displayed on your public profile. Maximum 240 characters.</p>
        </div>
        <div>
          <Textarea aria-label="Organization Bio" name="bio" />
        </div>
      </section>

      <Separator className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Email</Subheading>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">This is how customers can contact you for support.</p>
        </div>
        <div className="space-y-4">
          <Input type="email" aria-label="Organization Email" name="email" defaultValue="info@example.com" />
          <CheckboxField>
            <Checkbox name="email_is_public" defaultChecked />
            <Label>Show email on public profile</Label>
          </CheckboxField>
        </div>
      </section>

      <Separator className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Address</Subheading>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">This is where your organization is registered.</p>
        </div>
        <Address />
      </section>

      <Separator className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Currency</Subheading>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">The currency that your organization will be collecting.</p>
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

      <Separator className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="reset" variant="ghost">
          Reset
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
