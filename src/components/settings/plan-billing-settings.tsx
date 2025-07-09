'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { SettingSection } from '@/components/settings-section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Input } from '@/components/input'

export default function PlanBillingSettings() {
  const [plan, setPlan] = useState('Free')

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-10">
      <Heading>Plan & Billing</Heading>

      <SettingSection title="Current Plan" description="Manage your subscription plan.">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <Subheading level={3} className="!text-base">
              {plan} Plan
            </Subheading>
          </div>
          <Button type="button">Change plan</Button>
        </div>
      </SettingSection>

      <SettingSection title="Billing Information" description="Update your payment details.">
        <form onSubmit={handleSaveBilling} className="space-y-4 px-4 py-4">
          <Input aria-label="Cardholder name" placeholder="Cardholder name" />
          <Input aria-label="Card number" placeholder="Card number" />
          <div className="flex gap-4">
            <Input aria-label="Expiration" placeholder="MM/YY" className="flex-1" />
            <Input aria-label="CVC" placeholder="CVC" className="flex-1" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save billing info</Button>
          </div>
        </form>
      </SettingSection>

      <SettingSection title="Payment History" description="Your previous transactions.">
        <div className="px-4 pb-4">
          <Table className="[--gutter:--spacing(4)]">
            <TableHead>
              <TableRow>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>2024-01-01</TableCell>
                <TableCell>$9.99</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-12-01</TableCell>
                <TableCell>$9.99</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SettingSection>
    </div>
  )
}

