import { Command } from '../config/command-palette'

// Compass documentation structure
interface CompassDoc {
  id: string
  title: string
  description?: string
  path: string
  category: string
  content?: string
}

// Static compass documentation index (updated when compass changes)
const COMPASS_DOCS: CompassDoc[] = [
  {
    id: 'compass-app-docs-claude',
    title: 'CLAUDE.md - Development Guide',
    description: 'Complete development guide and architecture overview',
    path: 'CLAUDE.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-readme',
    title: 'README - Project Overview',
    description: 'Project setup and basic information',
    path: 'README.md', 
    category: 'compass'
  },
  {
    id: 'compass-app-docs-authentication',
    title: 'Authentication Setup Guide',
    description: 'Supabase Auth configuration and usage',
    path: 'authentication/setup-guide.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-database',
    title: 'Database Schema',
    description: 'Database structure and relationships',
    path: 'database/schema.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-components',
    title: 'UI Components Guide', 
    description: 'shadcn/ui and kiboUI integration patterns',
    path: 'components/kibo-ui.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-testing',
    title: 'Testing Guidelines',
    description: 'Testing setup and best practices',
    path: 'testing/guidelines.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-theme',
    title: 'Theme System',
    description: 'Dual theme support and 8px grid system',
    path: 'theming/theme-system.md',
    category: 'compass'
  },
  {
    id: 'compass-app-docs-ci-cd',
    title: 'CI/CD Setup',
    description: 'GitHub Actions and Vercel deployment',
    path: 'ci-cd/setup.md',
    category: 'compass'
  }
]

// Get compass documentation files
export function getCompassDocs(): CompassDoc[] {
  return COMPASS_DOCS
}

function extractTitle(content: string, filename: string): string {
  // Try to extract title from first H1
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  
  // Fallback to filename without extension
  return filename.replace('.md', '').replace(/[-_]/g, ' ')
}

function extractDescription(content: string): string {
  // Extract first paragraph after title
  const lines = content.split('\n')
  let descriptionStart = -1
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      descriptionStart = i + 1
      break
    }
  }
  
  if (descriptionStart >= 0) {
    for (let i = descriptionStart; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('#') && !line.startsWith('```')) {
        return line.length > 100 ? line.substring(0, 100) + '...' : line
      }
    }
  }
  
  return ''
}

// Generate compass commands for command palette
export function generateCompassCommands(): Command[] {
  const docs = getCompassDocs()
  
  return docs.map(doc => ({
    id: doc.id,
    title: `📖 ${doc.title}`,
    description: doc.description || `Open ${doc.category} documentation`,
    category: 'compass',
    icon: 'book-open',
    keywords: [doc.title, doc.category, doc.path, 'docs', 'documentation', 'compass'],
    action: () => {
      // Open documentation in a modal or new tab
      openCompassDoc(doc)
    }
  }))
}

function openCompassDoc(doc: CompassDoc): void {
  // Open compass documentation in a new tab/window with VS Code or file system
  const compassPath = `compass/knowledge/app-docs/${doc.path}`
  
  // Show notification with file path
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg'
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Compass Doc: ${doc.title}</span>
    </div>
    <div class="text-xs mt-1 opacity-80">Path: ${compassPath}</div>
  `
  
  document.body.appendChild(notification)
  
  // Auto remove notification after 3 seconds
  setTimeout(() => {
    notification.remove()
  }, 3000)
  
  // Copy path to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(compassPath).catch(() => {
      console.log('Could not copy to clipboard')
    })
  }
}

function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/```([^`]*)```/gim, '<pre><code>$1</code></pre>')
    .replace(/`([^`]*)`/gim, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/\n/gim, '<br>')
}