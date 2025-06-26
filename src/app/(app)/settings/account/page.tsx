'use client'

import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { SettingSection, ToggleItem } from '@/components/settings-section'
import { GoogleIcon, AppleIcon } from '@/components/icons'

export default function AccountSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <div className="space-y-10">
      <Heading>Account</Heading>

      <SettingSection title="Profile" description="Manage your personal information.">
        <div className="flex items-center gap-4 px-4 py-3">
          <Avatar src="/avatar.png" initials="A" />
          <div>
            <Button outline type="button">Change</Button>
          </div>
        </div>
        <div className="px-4 py-3 space-y-4">
          <Field>
            <Label>Name</Label>
            <Input name="name" defaultValue="Your Name" />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input type="email" name="email" defaultValue="you@example.com" />
          </Field>
        </div>
      </SettingSection>

      <SettingSection title="Password" description="Update your password.">
        <div className="px-4 py-3 space-y-4">
          <Field>
            <Label>New password</Label>
            <Input type="password" name="new_password" />
          </Field>
          <Field>
            <Label>Confirm password</Label>
            <Input type="password" name="confirm_password" />
          </Field>
          <Button type="button">Update password</Button>
        </div>
      </SettingSection>

      <SettingSection title="Two-factor authentication" description="Protect your account with an extra layer of security.">
        <ToggleItem
          label="Enable two-factor authentication"
          value={twoFactor}
          onChange={setTwoFactor}
        />
      </SettingSection>

      <SettingSection title="Social accounts" description="Connect additional sign in methods.">
        <div className="flex flex-col gap-2 px-4 py-3">
          <Button outline type="button">
            <GoogleIcon data-slot="icon" className="size-5" />
            Connect Google
          </Button>
          <Button outline type="button">
            <AppleIcon data-slot="icon" className="size-5" />
            Connect Apple
          </Button>
        </div>
      </SettingSection>

      <SettingSection title="Danger zone" description="Delete your account and all related data.">
        <div className="px-4 py-3">
          <Button color="red" type="button">
            Delete account
          </Button>
        </div>
      </SettingSection>
    </div>
  )
}
