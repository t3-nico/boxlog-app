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
      console.log('Using cached response for query:', userQuery)
      
      // Create a streaming response for cached content
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        start(controller) {
          const chunk = `0:"${cachedResponse.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
          controller.enqueue(encoder.encode(chunk))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
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

    // Check if OpenAI API key is available - use mock streaming
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found - returning mock streaming response')
      
      // Create mock response content based on the query
      let mockContent = `🤖 **MOCK RESPONSE** - Hello! I'm the BoxLog support assistant (currently in mock mode).`
      
      if (userQuery.toLowerCase().includes('dark') || userQuery.includes('ダークモード')) {
        mockContent = `🤖 **MOCK RESPONSE** - Yes, BoxLog supports **Dark Mode**!

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
      } else if (userQuery.toLowerCase().includes('features') || userQuery.toLowerCase().includes('機能')) {
        mockContent = `🤖 **MOCK RESPONSE** - ## BoxLog Main Features:

📅 **Calendar View**
- Daily, weekly, monthly task display
- Drag & drop task management
- Timeline visualization

📋 **Task Management**
- Create, edit, delete tasks
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Completed)
- Due date management

🏷️ **Tag System**
- Categorize tasks with custom tags
- Color-coded organization
- Filter by multiple tags

🔄 **Smart Folders**
- Automated task organization
- Custom filter rules
- Dynamic content updates

📊 **Progress Tracking**
- Completion statistics
- Time tracking
- Productivity insights

📱 **Cross-Platform**
- Responsive web design
- Mobile-friendly interface
- Real-time synchronization

For detailed usage guides, visit: [BoxLog Documentation](https://github.com/t3-nico/boxlog-web)

What specific feature would you like to know more about?`
      } else {
        mockContent = `🤖 **MOCK RESPONSE** - Thank you for your question: "${userQuery}"

I can help you with:
- **Calendar features** - scheduling and time management
- **Task management** - creating and organizing tasks  
- **Tags and organization** - categorizing your work
- **Smart folders** - automated organization
- **Settings and preferences** - customizing BoxLog
- **Troubleshooting** - solving common issues

Could you please be more specific about what you'd like to know?

For comprehensive guides, check: [BoxLog Documentation](https://github.com/t3-nico/boxlog-web)

*Note: This is a mock response. OpenAI API key is not configured.*`
      }

      // Apply token limiting
      const maxTokens = 600
      const estimatedTokens = mockContent.split(' ').length * 1.3
      if (estimatedTokens > maxTokens) {
        const wordsToKeep = Math.floor(maxTokens / 1.3)
        const words = mockContent.split(' ')
        mockContent = words.slice(0, wordsToKeep).join(' ') + '...\n\n*Response truncated to stay within token limits.*'
      }

      // Cache the response
      cacheResponse(userQuery, mockContent)
      
      console.log('Creating mock streaming response')

      // Create a mock streaming response using the proper format
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        start(controller) {
          // Send the response content as a streaming data chunk
          const chunk = `0:"${mockContent.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
          controller.enqueue(encoder.encode(chunk))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      })
    }

    console.log('Starting OpenAI stream with enhanced token limiting...')
    
    // Enhanced token limiting: Truncate system prompt if too long
    let optimizedSystemPrompt = systemPrompt
    const systemTokenEstimate = systemPrompt.split(' ').length * 1.3
    if (systemTokenEstimate > 1500) {
      const wordsToKeep = Math.floor(1500 / 1.3)
      const words = systemPrompt.split(' ')
      optimizedSystemPrompt = words.slice(0, wordsToKeep).join(' ') + '\n\n[System prompt truncated for token efficiency]'
    }

    // Enhanced token limiting: Limit conversation history
    const maxHistoryTokens = 1000
    let limitedMessages = [...messages]
    let historyTokens = 0
    
    for (let i = limitedMessages.length - 1; i >= 0; i--) {
      const messageTokens = limitedMessages[i].content.split(' ').length * 1.3
      if (historyTokens + messageTokens > maxHistoryTokens) {
        limitedMessages = limitedMessages.slice(i + 1)
        break
      }
      historyTokens += messageTokens
    }

    console.log(`Token optimization: System prompt: ${Math.floor(systemTokenEstimate)} tokens, History: ${Math.floor(historyTokens)} tokens`)

    // Stream the response with aggressive cost optimization
    const result = await streamText({
      model: openai('gpt-3.5-turbo'), // Cost optimization: Use GPT-3.5 instead of GPT-4 (90% cheaper)
      system: optimizedSystemPrompt,
      messages: limitedMessages,
      temperature: 0.7,
      maxTokens: 600, // Cost optimization: Further reduced response length
      frequencyPenalty: 0.1, // Reduce repetition
      presencePenalty: 0.1, // Encourage conciseness
    })
    
    console.log('OpenAI stream created successfully with token limits')
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      type: typeof error,
      error: error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: errorMessage,
        type: 'api_error'
      },
      { status: 500 }
    )
  }
}