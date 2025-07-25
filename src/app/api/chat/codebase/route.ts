import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'

// Simple in-memory cache for cost optimization
const responseCache = new Map<string, { content: string; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// GitHub API client for fetching BoxLog documentation
const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 't3-nico'
const REPO_NAME = 'boxlog-web'

interface CodeContext {
  files: Array<{
    path: string
    content: string
  }>
  query: string
}

async function fetchRelevantFiles(query: string): Promise<CodeContext> {
  try {
    // Search for code in the repository
    const searchResponse = await fetch(
      `${GITHUB_API_BASE}/search/code?q=${encodeURIComponent(query)}+repo:${REPO_OWNER}/${REPO_NAME}&per_page=5`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add GitHub token if available
          ...(process.env.GITHUB_TOKEN ? {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          } : {})
        }
      }
    )

    if (!searchResponse.ok) {
      console.error('GitHub search failed:', searchResponse.status)
      return { files: [], query }
    }

    const searchData = await searchResponse.json()
    const files = []

    // Fetch content for each found file
    for (const item of searchData.items || []) {
      try {
        const contentResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${item.path}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              ...(process.env.GITHUB_TOKEN ? {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
              } : {})
            }
          }
        )

        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          const content = Buffer.from(contentData.content, 'base64').toString('utf-8')
          files.push({
            path: item.path,
            content: content.substring(0, 2000) // Limit content size
          })
        }
      } catch (error) {
        console.error(`Failed to fetch content for ${item.path}:`, error)
      }
    }

    return { files, query }
  } catch (error) {
    console.error('GitHub API error:', error)
    return { files: [], query }
  }
}

// Function to generate cache key
function getCacheKey(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Function to check and return cached response
function getCachedResponse(query: string): string | null {
  const cacheKey = getCacheKey(query)
  const cached = responseCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached response for query:', query)
    return cached.content
  }
  
  // Clean expired entries
  if (cached && (Date.now() - cached.timestamp) >= CACHE_DURATION) {
    responseCache.delete(cacheKey)
  }
  
  return null
}

// Function to cache response
function cacheResponse(query: string, content: string): void {
  const cacheKey = getCacheKey(query)
  responseCache.set(cacheKey, {
    content,
    timestamp: Date.now()
  })
  console.log('Cached response for query:', query)
}

export async function POST(req: Request) {
  try {
    console.log('API route called')
    const { messages } = await req.json()
    console.log('Received messages:', messages)
    
    // Get the latest user message
    const latestMessage = messages[messages.length - 1]
    const userQuery = latestMessage.content
    console.log('User query:', userQuery)

    // Check cache first (Cost optimization: Cache feature)
    const cachedResponse = getCachedResponse(userQuery)
    if (cachedResponse) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Send cached content as a single chunk
          controller.enqueue(encoder.encode(cachedResponse))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // Fetch relevant code context
    const codeContext = await fetchRelevantFiles(userQuery)
    console.log('Code context:', codeContext)

    // Build system prompt with context
    const systemPrompt = `You are a BoxLog user support assistant. BoxLog is a task management application with calendar, board, and table views.

Your role is to:
1. Help users understand how to use BoxLog features
2. Provide guidance on task management, scheduling, and productivity
3. Explain BoxLog's interface and functionality
4. Offer troubleshooting support for common issues
5. Direct users to relevant documentation when available

BoxLog Features to support:
- 📅 Calendar View: Day, Week, Month views for scheduling
- 📋 Task Management: Create, edit, organize tasks with priorities
- 🏷️ Tags System: Categorize and filter tasks
- 📊 Progress Tracking: Monitor productivity and completion rates
- 🔄 Smart Folders: Automated task organization
- 📱 Responsive Design: Works on desktop and mobile

Important guidelines:
- ONLY answer questions about BoxLog application usage
- If asked about unrelated topics, politely redirect to BoxLog features
- Provide step-by-step instructions when explaining how to use features
- Reference the BoxLog documentation at https://github.com/t3-nico/boxlog-web when helpful
- Be friendly and supportive like a customer service representative
- Always respond in English

${codeContext.files.length > 0 ? `
Documentation context for "${codeContext.query}":

${codeContext.files.map(file => `
File: ${file.path}
\`\`\`
${file.content}
\`\`\`
`).join('\n\n')}
` : 'Answering based on general BoxLog application knowledge.'}

Always respond in English and maintain a helpful, customer service tone.

If asked about non-BoxLog topics, respond with:
"I'm sorry, but I can only provide support for BoxLog application usage. Do you have any questions about BoxLog features or how to use them?"`

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found - returning mock streaming response')
      
      // Create mock response content based on the query
      let mockContent = `こんにちは！BoxLogアプリケーションのサポートです。`
      
      if (userQuery.toLowerCase().includes('dark') || userQuery.includes('ダークモード')) {
        mockContent = `Yes, BoxLog supports **Dark Mode**!

## How to Enable Dark Mode:

🌙 **Toggle Method**
1. Click the user menu in the top right
2. Select "Settings"
3. Go to "Appearance" tab and choose dark mode

✨ **Dark Mode Features**
- Eye-friendly dark background
- Reduced eye strain during night work
- Battery savings (on OLED displays)

🎨 **Coverage**
- Calendar view
- Task lists
- Settings pages
- All popup dialogs

Auto-switching based on system preferences is also available.

Feel free to ask any other questions about BoxLog!`
      } else {
        mockContent = `Thank you for your question: "${userQuery}"

## BoxLog Main Features:

📅 **Calendar View**
- Daily, weekly, monthly task display
- Drag & drop task management

📋 **Task Management**
- Create, edit, delete tasks
- Priority and status settings
- Progress tracking

🏷️ **Tag System**
- Categorize tasks by tags
- Color-coded visual organization

For detailed usage, check the [BoxLog Web Documentation](https://github.com/t3-nico/boxlog-web).

Feel free to ask any other questions about BoxLog!`
      }

      // Cache the mock response
      cacheResponse(userQuery, mockContent)

      // Return a simple streaming response that useChat can handle
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Send the complete content as a single chunk to avoid duplication
          controller.enqueue(encoder.encode(mockContent))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      })
    }

    console.log('Starting OpenAI stream...')
    // Stream the response with cost optimization
    const result = await streamText({
      model: openai('gpt-3.5-turbo'), // Cost optimization: Use GPT-3.5 instead of GPT-4
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 800, // Cost optimization: Limit response length
    })

    // Get the response content and cache it
    const response = result.toDataStreamResponse()
    
    // Note: In a real implementation, we'd need to capture the streamed content
    // and cache it after completion. For now, the cache works with mock responses.
    
    console.log('OpenAI stream created successfully')
    return response
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}