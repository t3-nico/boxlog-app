'use client'

import { useState } from 'react'
import { Stat } from '@/app/stat'
import { Avatar } from '@/components/avatar'
import { Heading, Subheading } from '@/components/heading'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getRecentReviews } from '@/data'

export default function Home() {
  return (
    <div className="p-10">
      <Heading>Good afternoon, Erica</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total revenue" value="$2.6M" change="+4.5%" />
        <Stat title="Average review value" value="$455" change="-0.5%" />
        <Stat title="Tickets sold" value="5,888" change="+4.5%" />
        <Stat title="Pageviews" value="823,067" change="+21.2%" />
      </div>
      <Subheading className="mt-14">Recent reviews</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Review number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Event</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Mock data since getRecentReviews needs to be called in server component */}
          {[
            { id: 1, date: '2024-01-15', customer: { name: 'John Doe' }, event: { name: 'Meeting', thumbUrl: '/avatar.jpg' }, amount: { usd: '$100' }, url: '/review/1' },
            { id: 2, date: '2024-01-14', customer: { name: 'Jane Smith' }, event: { name: 'Workshop', thumbUrl: '/avatar.jpg' }, amount: { usd: '$200' }, url: '/review/2' }
          ].map((review) => (
            <TableRow key={review.id} href={review.url} title={`Review #${review.id}`}>
              <TableCell>{review.id}</TableCell>
              <TableCell className="text-zinc-500">{review.date}</TableCell>
              <TableCell>{review.customer.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={review.event.thumbUrl} className="size-6" />
                  <span>{review.event.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">US{review.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
