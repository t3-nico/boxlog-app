'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBoxStore } from '@/lib/box-store'
import { useToast } from '@/components/ui/toast'
import { exportToCSV, exportToJSON, printTasks } from '@/lib/export'
import { Button } from '@/components/ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/dropdown'
import {
  Download,
  ChevronDown,
  FileText,
  Printer,
  Table,
} from 'lucide-react'

interface ExportMenuProps {
  className?: string
}

export function ExportMenu({ className }: ExportMenuProps) {
  const { getSortedTasks, getFilteredTasks } = useBoxStore()
  const { success, error } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      const tasks = getSortedTasks()
      
      if (tasks.length === 0) {
        error('No data to export', 'Please add some tasks first')
        return
      }

      const filename = `tasks-${new Date().toISOString().split('T')[0]}`
      exportToCSV(tasks, filename)
      
      success('Export successful', `Exported ${tasks.length} tasks to CSV`)
    } catch (err) {
      error('Export failed', 'Failed to export tasks to CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async () => {
    try {
      setIsExporting(true)
      const tasks = getSortedTasks()
      
      if (tasks.length === 0) {
        error('No data to export', 'Please add some tasks first')
        return
      }

      const filename = `tasks-${new Date().toISOString().split('T')[0]}`
      exportToJSON(tasks, filename)
      
      success('Export successful', `Exported ${tasks.length} tasks to JSON`)
    } catch (err) {
      error('Export failed', 'Failed to export tasks to JSON')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = async () => {
    try {
      setIsExporting(true)
      const tasks = getSortedTasks()
      
      if (tasks.length === 0) {
        error('No data to print', 'Please add some tasks first')
        return
      }

      printTasks(tasks)
      success('Print ready', 'Print dialog opened')
    } catch (err) {
      error('Print failed', 'Failed to open print dialog')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportFiltered = async () => {
    try {
      setIsExporting(true)
      const filteredTasks = getFilteredTasks()
      
      if (filteredTasks.length === 0) {
        error('No filtered data', 'No tasks match the current filters')
        return
      }

      const filename = `filtered-tasks-${new Date().toISOString().split('T')[0]}`
      exportToCSV(filteredTasks, filename)
      
      success('Export successful', `Exported ${filteredTasks.length} filtered tasks to CSV`)
    } catch (err) {
      error('Export failed', 'Failed to export filtered tasks')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={className}>
      <Dropdown>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DropdownButton 
            as={Button}
            variant="outline"
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isExporting ? 'Exporting...' : 'Export'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </DropdownButton>
        </motion.div>
        
        <DropdownMenu className="w-48">
          <DropdownItem onClick={handleExportCSV} disabled={isExporting}>
            <Table className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownItem>
          
          <DropdownItem onClick={handleExportJSON} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownItem>
          
          <DropdownItem onClick={handleExportFiltered} disabled={isExporting}>
            <Table className="mr-2 h-4 w-4" />
            Export Filtered
          </DropdownItem>
          
          <div className="border-t border-gray-100 my-1" />
          
          <DropdownItem onClick={handlePrint} disabled={isExporting}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}