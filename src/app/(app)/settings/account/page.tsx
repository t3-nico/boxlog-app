'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-browser'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { SettingSection, ToggleItem } from '@/components/settings-section'
import { GoogleIcon, AppleIcon } from '@/components/icons'

export default function AccountSettingsPage() {
  const { user, signInWithOAuth, updatePassword, signOut } = useAuthContext()
  const supabase = createClient()

  const [name, setName] = useState(
    (user?.user_metadata as any)?.full_name ?? ''
  )
  const [email, setEmail] = useState(user?.email ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { full_name: name },
        email,
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword || newPassword.length < 6) return
    setChangingPassword(true)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setChangingPassword(false)
    }
  }

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
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="button" onClick={handleProfileSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </SettingSection>

      <SettingSection title="Password" description="Update your password.">
        <div className="px-4 py-3 space-y-4">
          <Field>
            <Label>New password</Label>
            <Input
              type="password"
              name="new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Label>Confirm password</Label>
            <Input
              type="password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Button
            type="button"
            onClick={handlePasswordUpdate}
            disabled={changingPassword}
          >
            {changingPassword ? 'Updating...' : 'Update password'}
          </Button>
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
          <Button
            outline
            type="button"
            onClick={() => signInWithOAuth('google')}
          >
            <GoogleIcon data-slot="icon" className="size-5" />
            Connect Google
          </Button>
          <Button
            outline
            type="button"
            onClick={() => signInWithOAuth('apple')}
          >
            <AppleIcon data-slot="icon" className="size-5" />
            Connect Apple
          </Button>
        </div>
      </SettingSection>

      <SettingSection title="Danger zone" description="Delete your account and all related data.">
        <div className="px-4 py-3">
          <Button color="red" type="button" onClick={signOut}>
            Delete account
          </Button>
        </div>
      </SettingSection>
    </div>
  )
}
