'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/text'
import { SettingSection } from '@/components/settings-section'
import { Switch } from '@/components/switch'

export default function AccountSettings() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
  }

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordError(null)
    // TODO: connect to backend
  }

  const handleDeleteAccount = () => {
    // TODO: connect to backend
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-10">
      <Heading>Account</Heading>

      <SettingSection title="Profile" description="Update your personal information.">
        <form onSubmit={handleNameSave} className="space-y-4 px-4 py-4">
          <Input
            aria-label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
          <Input
            type="email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="mt-2"
            required
          />
          <div className="flex justify-end">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </SettingSection>

      <SettingSection title="Password" description="Change your account password.">
        <form onSubmit={handlePasswordSave} className="space-y-4 px-4 py-4">
          <Input
            type="password"
            aria-label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
          <Input
            type="password"
            aria-label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <Input
            type="password"
            aria-label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          {passwordError && <Text className="text-red-600">{passwordError}</Text>}
          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </SettingSection>

      <SettingSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <Subheading level={3} className="!text-base">
              Enable 2FA
            </Subheading>
            <Text className="mt-1">Require a second step to sign in.</Text>
          </div>
          <Switch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
        </div>
        {twoFactorEnabled && (
          <div className="flex justify-end px-4 pb-4">
            <Button type="button">Set up 2FA</Button>
          </div>
        )}
      </SettingSection>

      <SettingSection
        title="Danger Zone"
        description="Delete your account and all associated data."
      >
        <div className="flex justify-between px-4 py-4">
          <div className="space-y-1">
            <Subheading level={3} className="!text-base text-red-600 dark:text-red-400">
              Delete account
            </Subheading>
            <Text className="text-red-600 dark:text-red-400">
              This action is irreversible.
            </Text>
          </div>
          <Button type="button" onClick={handleDeleteAccount} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
            Delete
          </Button>
        </div>
      </SettingSection>
    </div>
  )
}

