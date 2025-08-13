import React from 'react'

export default function BoardPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Board View</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kanban style task management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Todo</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                <h3 className="font-medium">Sample Task 1</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Task description</p>
              </div>
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">In Progress</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border-l-4 border-yellow-500">
                <h3 className="font-medium">Sample Task 2</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Task in progress</p>
              </div>
            </div>
          </div>
          
          {/* Done Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Done</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border-l-4 border-green-500">
                <h3 className="font-medium">Sample Task 3</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed task</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}