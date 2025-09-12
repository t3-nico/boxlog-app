'use client'

import React from 'react'

import { Calendar, Clock, Users, Settings } from 'lucide-react'

import { NavigationTemplate, NavigationSection, NavigationItem } from '../'
import { CreateButton } from '../../create-button'

/**
 * Calendar機能用のナビゲーション例
 * 各featureで同様のパターンで実装可能
 */
export const CalendarNavigationExample = () => {
  return (
    <NavigationTemplate
      sections={[
        {
          id: 'main',
          items: [
            <CreateButton key="create" />
          ]
        },
        {
          id: 'views',
          title: 'Views',
          items: [
            <NavigationItem
              key="week"
              label="Week View"
              href="/calendar/week"
              icon={Calendar}
              isActive={false}
            />,
            <NavigationItem
              key="month"
              label="Month View"
              href="/calendar/month"
              icon={Calendar}
            />,
            <NavigationItem
              key="agenda"
              label="Agenda"
              href="/calendar/agenda"
              icon={Clock}
              badge="3"
            />
          ]
        },
        {
          id: 'filters',
          title: 'Filters',
          items: [
            <NavigationItem
              key="my-events"
              label="My Events"
              href="/calendar/my-events"
              icon={Users}
              isActive={false}
            />,
            <NavigationItem
              key="shared"
              label="Shared"
              href="/calendar/shared"
              icon={Users}
            />
          ]
        }
      ]}
      footerContent={
        <NavigationSection>
          <NavigationItem
            label="Calendar Settings"
            href="/calendar/settings"
            icon={Settings}
            variant="compact"
          />
        </NavigationSection>
      }
    />
  )
}