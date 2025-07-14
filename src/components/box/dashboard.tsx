'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useBoxStore } from '@/lib/box-store'
import { Task, TaskStatus, TaskPriority } from '@/types/box'
import { Badge } from '@/components/badge'
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react'

// Simple Chart Component (replacing Chart.js dependency)
interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
}

function PieChart({ data, size = 120 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div 
        className="rounded-full bg-gray-200 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-500">No data</span>
      </div>
    )
  }

  let cumulativePercentage = 0
  const radius = size / 2 - 4
  const centerX = size / 2
  const centerY = size / 2

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = item.value / total
          const startAngle = cumulativePercentage * 2 * Math.PI
          const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI
          
          const x1 = centerX + radius * Math.cos(startAngle)
          const y1 = centerY + radius * Math.sin(startAngle)
          const x2 = centerX + radius * Math.cos(endAngle)
          const y2 = centerY + radius * Math.sin(endAngle)
          
          const largeArcFlag = percentage > 0.5 ? 1 : 0
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          cumulativePercentage += percentage

          return (
            <motion.path
              key={index}
              d={pathData}
              fill={item.color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-full mt-2 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  index: number
}

function StatCard({ title, value, subtitle, icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-white rounded-lg border p-6 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-50">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const { getSortedTasks } = useBoxStore()
  const tasks = getSortedTasks()

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Basic counts
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'Done').length
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
    
    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // This month's tasks
    const thisMonthTasks = tasks.filter(task => 
      task.createdAt && new Date(task.createdAt) >= thisMonth
    )
    const thisMonthCompleted = thisMonthTasks.filter(task => task.status === 'Done').length
    const thisMonthRate = thisMonthTasks.length > 0 
      ? Math.round((thisMonthCompleted / thisMonthTasks.length) * 100) 
      : 0

    // Overdue and upcoming tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'Done' && 
      task.status !== 'Cancelled'
    )
    
    const upcomingTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) <= nextWeek && 
      new Date(task.dueDate) >= now &&
      task.status !== 'Done' && 
      task.status !== 'Cancelled'
    )

    // Status distribution
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<TaskStatus, number>)

    // Priority distribution
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<TaskPriority, number>)

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate,
      thisMonthTasks: thisMonthTasks.length,
      thisMonthRate,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      statusCounts,
      priorityCounts,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
    }
  }, [tasks])

  // Prepare chart data
  const statusChartData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    label: status,
    value: count,
    color: getStatusColor(status as TaskStatus)
  }))

  const priorityChartData = Object.entries(stats.priorityCounts).map(([priority, count]) => ({
    label: priority,
    value: count,
    color: getPriorityColor(priority as TaskPriority)
  }))

  function getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'Todo': return '#6b7280'
      case 'In Progress': return '#3b82f6'
      case 'Done': return '#10b981'
      case 'Cancelled': return '#ef4444'
      case 'Backlog': return '#9ca3af'
      default: return '#6b7280'
    }
  }

  function getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#10b981'
      default: return '#6b7280'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
          color="border-blue-200"
          index={0}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.completedTasks}/${stats.totalTasks} completed`}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="border-green-200"
          index={1}
        />
        <StatCard
          title="This Month"
          value={`${stats.thisMonthRate}%`}
          subtitle={`${stats.thisMonthTasks} tasks this month`}
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          color="border-purple-200"
          index={2}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          subtitle={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'On track'}
          icon={<Clock className="h-6 w-6 text-orange-600" />}
          color="border-orange-200"
          index={3}
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-lg border p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
          <div className="flex justify-center">
            <PieChart data={statusChartData} />
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-lg border p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
          <div className="flex justify-center">
            <PieChart data={priorityChartData} />
          </div>
        </motion.div>

        {/* Alerts and Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-lg border p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Upcoming</h3>
          
          {/* Overdue Tasks */}
          {stats.overdue.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {stats.overdue.length} Overdue Task{stats.overdue.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-1">
                {stats.overdue.slice(0, 3).map(task => (
                  <div key={task.id} className="text-xs text-gray-600 pl-7">
                    {task.task}: {task.title.slice(0, 40)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {stats.upcoming.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  {stats.upcoming.length} Due This Week
                </span>
              </div>
              <div className="space-y-1">
                {stats.upcoming.slice(0, 3).map(task => (
                  <div key={task.id} className="text-xs text-gray-600 pl-7">
                    {task.task}: {task.title.slice(0, 40)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.overdue.length === 0 && stats.upcoming.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">All caught up!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="bg-white rounded-lg border p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <Badge color={task.status === 'Done' ? 'green' : task.status === 'In Progress' ? 'blue' : 'zinc'}>
                    {task.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500">{task.title.slice(0, 60)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge color={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'green'}>
                    {task.priority}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}