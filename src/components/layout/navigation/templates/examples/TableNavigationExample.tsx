'use client'

import React from 'react'

import { Table, Filter, Download, Eye } from 'lucide-react'

import { NavigationTemplate, NavigationItem } from '../'
import { CreateButton } from '../../create-button'

/**
 * Table機能用のナビゲーション例
 */
export const TableNavigationExample = () => {
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
          title: 'Table Views',
          items: [
            <NavigationItem
              key="all-tasks"
              label="All Tasks"
              href="/table"
              icon={Table}
              isActive={true}
            />,
            <NavigationItem
              key="active"
              label="Active"
              href="/table/active"
              icon={Eye}
              badge="12"
            />,
            <NavigationItem
              key="completed"
              label="Completed"
              href="/table/completed"
              icon={Eye}
              badge="45"
            />
          ]
        },
        {
          id: 'filters',
          title: 'Filters & Actions',
          items: [
            <NavigationItem
              key="filter"
              label="Advanced Filter"
              href="/table/filter"
              icon={Filter}
            />,
            <NavigationItem
              key="export"
              label="Export Data"
              onClick={() => console.log('Export')}
              icon={Download}
            />
          ]
        }
      ]}
      spacing="compact"
    />
  )
}