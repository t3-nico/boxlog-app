'use client'

import { Heading, Subheading } from '@/components/heading'
import { Button } from '@/components/ui/button'
import { SettingSection } from '@/components/settings-section'

export default function DataExportSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <Heading>Data & Export</Heading>

      <SettingSection title="Export" description="Download your data in various formats.">
        <div className="flex flex-wrap gap-4 px-4 py-4">
          <Button type="button">Export CSV</Button>
          <Button type="button">Export JSON</Button>
        </div>
      </SettingSection>

      <SettingSection title="Backup" description="Create a backup of tags and tickets.">
        <div className="px-4 py-4">
          <Button type="button">Generate Backup</Button>
        </div>
      </SettingSection>

      <SettingSection title="Data Deletion" description="Request deletion of your data.">
        <div className="px-4 py-4">
          <Button type="button" className="bg-[var(--color-error-600)] text-white hover:bg-[var(--color-error-700)]">
            Request deletion
          </Button>
        </div>
      </SettingSection>
    </div>
  )
}

