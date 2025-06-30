'use client'

import { Heading } from '@/components/heading'
import { SettingSection } from '@/components/settings-section'
import { Text } from '@/components/text'
import { SettingsLayout } from './settings-layout'

export default function AboutLegalSettings() {
  return (
    <SettingsLayout>
      <Heading>About / Legal</Heading>

      <SettingSection title="Terms of Service & Privacy" description="Important legal information.">
        <div className="px-4 py-4 space-y-2">
          <Text>
            <a href="#" className="text-blue-600 underline dark:text-blue-500">Terms of Service</a>
          </Text>
          <Text>
            <a href="#" className="text-blue-600 underline dark:text-blue-500">Privacy Policy</a>
          </Text>
        </div>
      </SettingSection>

      <SettingSection title="App Information" description="Version details and support.">
        <div className="px-4 py-4 space-y-2">
          <Text>Version 1.0.0</Text>
          <Text>
            Contact{' '}
            <a href="mailto:support@example.com" className="text-blue-600 underline dark:text-blue-500">
              support@example.com
            </a>
          </Text>
        </div>
      </SettingSection>
    </SettingsLayout>
  )
}

