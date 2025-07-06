import { Task } from '@/types/box'

// CSV export functionality
export function exportToCSV(tasks: Task[], filename = 'tasks') {
  const headers = [
    'Task ID',
    'Title', 
    'Type',
    'Status',
    'Priority',
    'Description',
    'Due Date',
    'Created At',
    'Updated At',
    'Estimated Hours',
    'Actual Hours',
    'Tags'
  ]

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      `"${task.task}"`,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.type}"`,
      `"${task.status}"`,
      `"${task.priority}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      `"${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}"`,
      `"${new Date(task.createdAt).toLocaleDateString()}"`,
      `"${new Date(task.updatedAt).toLocaleDateString()}"`,
      `"${task.estimatedHours || ''}"`,
      `"${task.actualHours || ''}"`,
      `"${(task.tags || []).join('; ')}"`,
    ].join(','))
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// JSON export functionality
export function exportToJSON(tasks: Task[], filename = 'tasks') {
  const jsonContent = JSON.stringify(tasks, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

// Print functionality
export function printTasks(tasks: Task[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const printHTML = generatePrintHTML(tasks)
  
  printWindow.document.write(printHTML)
  printWindow.document.close()
  printWindow.focus()
  
  // Small delay to ensure content is loaded
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Generate HTML for printing
function generatePrintHTML(tasks: Task[]): string {
  const currentDate = new Date().toLocaleDateString()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Task Report - ${currentDate}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        
        .header .meta {
          margin-top: 5px;
          color: #666;
          font-size: 14px;
        }
        
        .summary {
          background: #f5f5f5;
          padding: 15px;
          margin-bottom: 20px;
          border-left: 4px solid #007bff;
        }
        
        .summary h2 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-item .value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .summary-item .label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .task-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .task-table th,
        .task-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        
        .task-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 11px;
        }
        
        .task-table td {
          font-size: 10px;
        }
        
        .status-badge,
        .priority-badge,
        .type-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-todo { background: #e9ecef; color: #495057; }
        .status-in-progress { background: #cce5ff; color: #0056b3; }
        .status-done { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-backlog { background: #f8f9fa; color: #6c757d; }
        
        .priority-high { background: #f8d7da; color: #721c24; }
        .priority-medium { background: #fff3cd; color: #856404; }
        .priority-low { background: #d4edda; color: #155724; }
        
        .type-bug { background: #f8d7da; color: #721c24; }
        .type-feature { background: #cce5ff; color: #0056b3; }
        .type-documentation { background: #d4edda; color: #155724; }
        
        .task-id {
          font-family: monospace;
          font-weight: bold;
        }
        
        .task-title {
          font-weight: 500;
          max-width: 200px;
          word-wrap: break-word;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 10px;
        }
        
        @media print {
          body { margin: 0; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Task Report</h1>
        <div class="meta">Generated on ${currentDate} • Total: ${tasks.length} tasks</div>
      </div>
      
      ${generateSummaryHTML(tasks)}
      ${generateTaskTableHTML(tasks)}
      
      <div class="footer">
        <p>Generated by BoxLog Task Management System</p>
      </div>
    </body>
    </html>
  `
}

function generateSummaryHTML(tasks: Task[]): string {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Done').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  return `
    <div class="summary">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${totalTasks}</div>
          <div class="label">Total Tasks</div>
        </div>
        <div class="summary-item">
          <div class="value">${completedTasks}</div>
          <div class="label">Completed</div>
        </div>
        <div class="summary-item">
          <div class="value">${inProgressTasks}</div>
          <div class="label">In Progress</div>
        </div>
        <div class="summary-item">
          <div class="value">${completionRate}%</div>
          <div class="label">Completion Rate</div>
        </div>
      </div>
    </div>
  `
}

function generateTaskTableHTML(tasks: Task[]): string {
  const rows = tasks.map(task => `
    <tr>
      <td class="task-id">${task.task}</td>
      <td class="task-title">${task.title}</td>
      <td><span class="type-badge type-${task.type.toLowerCase()}">${task.type}</span></td>
      <td><span class="status-badge status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span></td>
      <td><span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span></td>
      <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
      <td>${new Date(task.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('')
  
  return `
    <table class="task-table">
      <thead>
        <tr>
          <th>Task ID</th>
          <th>Title</th>
          <th>Type</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Due Date</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}