# kiboUI Components Integration

The application has **INTEGRATED** advanced components from kiboUI, providing state-of-the-art UI patterns for AI chatbot functionality and advanced task management.

## Integration Status ✅ 100% Complete

### ✅ Core AI Components

- **AI Input** (kiboUI) - Advanced input with voice recognition, model selection, auto-resize
- **AI Conversation** (kiboUI) - Optimized chat display with auto-scroll and stick-to-bottom
- **AI Message** (kiboUI) - Unified message layout for user and assistant messages
- **AI Response** (kiboUI) - Advanced markdown rendering with syntax highlighting
- **AI Branch** (kiboUI) - Conversation branching for multiple response variants

### ✅ Supporting Components

- **Code Block** (kiboUI) - Syntax highlighting with copy functionality and language selection
- **Scroll Area** (kiboUI) - Optimized scrolling components
- **Badge/Button/Select/Textarea** (kiboUI) - Additional UI components for AI interface
- **Kanban** (kiboUI) - Modern kanban board with drag-and-drop functionality
- **Table** (kiboUI) - Advanced table component with @tanstack/react-table and Jotai sorting

## Component Usage Patterns

### AI Input Pattern

```tsx
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputSubmit,
  AIInputButton,
  AIInputTools,
  AIInputModelSelect
} from '@/components/ui/kibo-ui/ai/input'

<AIInput onSubmit={handleSubmit}>
  <AIInputTextarea
    value={inputValue}
    onChange={setInputValue}
    placeholder="Ask Claude..."
    minHeight={40}
    maxHeight={120}
  />
  <AIInputToolbar>
    <AIInputTools>
      {/* Voice Input */}
      <AIInputButton onClick={toggleVoiceInput}>
        <Mic className="w-4 h-4" />
      </AIInputButton>
      
      {/* Model Selection */}
      <AIInputModelSelect value={model} onValueChange={setModel}>
        <AIInputModelSelectTrigger>
          <AIInputModelSelectValue />
        </AIInputModelSelectTrigger>
        <AIInputModelSelectContent>
          <AIInputModelSelectItem value="claude-3-sonnet">Claude 3 Sonnet</AIInputModelSelectItem>
        </AIInputModelSelectContent>
      </AIInputModelSelect>
    </AIInputTools>
    
    <AIInputSubmit disabled={!inputValue.trim()} status="ready" />
  </AIInputToolbar>
</AIInput>
```

### AI Conversation Pattern

```tsx
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton
} from '@/components/ui/kibo-ui/ai/conversation'

<AIConversation>
  <AIConversationContent>
    {messages.map(message => (
      <MessageComponent key={message.id} message={message} />
    ))}
  </AIConversationContent>
  <AIConversationScrollButton />
</AIConversation>
```

### AI Message Pattern

```tsx
import {
  AIMessage,
  AIMessageContent,
  AIMessageAvatar
} from '@/components/ui/kibo-ui/ai/message'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'

<AIMessage from="assistant">
  <AIMessageAvatar src="/claude-avatar.png" name="Claude" />
  <AIMessageContent>
    <AIResponse>
      {message.content}
    </AIResponse>
  </AIMessageContent>
</AIMessage>
```

### AI Branch Pattern (Conversation Variants)

```tsx
import {
  AIBranch,
  AIBranchMessages,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchPage
} from '@/components/ui/kibo-ui/ai/branch'

<AIBranch onBranchChange={handleBranchChange}>
  <AIBranchMessages>
    {responseVariants.map((content, index) => (
      <AIResponse key={index}>{content}</AIResponse>
    ))}
  </AIBranchMessages>
  <AIBranchSelector from="assistant">
    <AIBranchPrevious />
    <AIBranchPage />
    <AIBranchNext />
  </AIBranchSelector>
</AIBranch>
```

### BoxLog Custom AI Response

```tsx
// Custom AI Response component optimized for BoxLog theme
const BoxLogAIResponse = ({ children, ...props }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert max-w-none
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
      [&_p]:leading-relaxed [&_p]:my-2
      [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800"
    options={{
      disallowedElements: ['script', 'iframe'],
      remarkPlugins: [],
    }}
    {...props}
  >
    {children}
  </AIResponse>
)
```

## Kanban Component Usage Pattern

### Kanban Board Pattern

```tsx
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard 
} from '@/components/ui/kibo-ui/kanban'

// Column and data definitions
const columns = [
  { id: 'todo', name: 'Todo', color: 'bg-gray-50' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', name: 'Done', color: 'bg-green-50' }
]

const data = [
  { id: '1', name: 'Task 1', column: 'todo', task: taskObject },
  { id: '2', name: 'Task 2', column: 'in_progress', task: taskObject }
]

<KanbanProvider 
  columns={columns} 
  data={data}
  onDataChange={handleDataChange}
>
  {(column) => (
    <KanbanBoard key={column.id} id={column.id}>
      <KanbanHeader>
        <span>{column.name}</span>
        <Badge>{getColumnTaskCount(column.id)}</Badge>
      </KanbanHeader>
      
      <KanbanCards id={column.id}>
        {(item) => (
          <KanbanCard key={item.id} id={item.id} name={item.name}>
            {/* Custom card content */}
          </KanbanCard>
        )}
      </KanbanCards>
    </KanbanBoard>
  )}
</KanbanProvider>
```

### Kanban Features

- ✅ **Drag & Drop**: Built-in @dnd-kit integration with accessibility
- ✅ **Type Safety**: Full TypeScript support with generic types
- ✅ **Theme Integration**: Supports light/dark mode via CSS variables
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Table Component Usage Pattern

### Table Component Pattern

```tsx
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  type ColumnDef,
} from '@/components/ui/kibo-ui/table'

// Column definitions with sorting
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <TableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue('title')}
      </div>
    ),
  },
  // More columns...
]

// Table implementation
<TableProvider columns={columns} data={tasks}>
  <TableHeader>
    {({ headerGroup }) => (
      <TableHeaderGroup headerGroup={headerGroup}>
        {({ header }) => (
          <TableHead key={header.id} header={header} />
        )}
      </TableHeaderGroup>
    )}
  </TableHeader>
  <TableBody>
    {({ row }) => (
      <TableRow key={row.id} row={row}>
        {({ cell }) => (
          <TableCell key={cell.id} cell={cell} />
        )}
      </TableRow>
    )}
  </TableBody>
</TableProvider>
```

### Table Features

- ✅ **Sorting**: Integrated @tanstack/react-table with Jotai state management
- ✅ **Filtering**: Built-in filtering capabilities
- ✅ **Selection**: Row selection with checkbox controls
- ✅ **Mobile Responsive**: Automatically switches to mobile cards on small screens
- ✅ **Inline Editing**: Dropdown editing for status and priority fields
- ✅ **Theme Integration**: Supports light/dark mode via CSS variables
- ✅ **Customization**: Flexible card content and column styling
- ✅ **Performance**: Optimized rendering with React.memo and virtual scrolling
- ✅ **BoxLog Integration**: Seamless integration with task management features

## Integration Benefits Achieved

1. **Advanced UX**: Voice input, model selection, conversation branching
2. **Security**: XSS prevention with content sanitization 
3. **Performance**: Optimized scroll management with use-stick-to-bottom
4. **Accessibility**: ARIA support and keyboard navigation
5. **Developer Experience**: Type-safe components with TypeScript
6. **Theme Integration**: Seamless light/dark mode support
7. **Markdown Support**: Rich content rendering with syntax highlighting

## AI Feature Implementation

### Voice Input Integration

- Web Speech API with Japanese language support
- Visual feedback during recording (red indicator)
- Automatic transcription to text input
- Fallback for unsupported browsers

### Model Selection Features

- Claude 3 Sonnet (default, balanced)
- Claude 3 Haiku (fast response)
- Claude 3 Opus (high performance)
- Dropdown interface with easy switching

### Conversation Branching

- Multiple AI response variants (string | string[])
- Navigation controls (previous/next/page indicator)
- Automatic branch detection and UI switching
- Personalization and preference tracking

### Security & Performance

- Content sanitization (script/iframe blocking)
- Memory optimization with React.memo
- Efficient re-rendering with proper dependencies
- Auto-scroll management without manual refs

## AI Components File Structure

```
src/components/ui/kibo-ui/ai/
├── input.tsx           # Advanced input with voice & model selection
├── conversation.tsx    # Auto-scroll conversation container
├── message.tsx        # Unified message layout
├── response.tsx       # Markdown rendering with security
├── branch.tsx         # Conversation branching system
├── source.tsx         # Source attribution
├── suggestion.tsx     # Response suggestions
├── tool.tsx          # Tool integration
└── reasoning.tsx      # AI reasoning display
```

## Component Selection Priority

1. **shadcn/ui** - For basic UI components (Button, Dialog, Select, etc.)
2. **kiboUI** - For advanced components (Gantt, ColorPicker, AI components, Kanban)
3. **Custom** - Only when neither provides the needed functionality

## kiboUI Integration Rules

- Install individually: `npx kibo-ui add [component]`
- Keep in separate `/kibo-ui/` directory to avoid conflicts
- Follow same Props naming pattern: `ComponentNameProps`
- Use consistent export pattern: named exports
- Maintain shadcn/ui styling compatibility

## Integration Status Summary

### AI機能 (kiboUI) - ✅ 統合済み
- **AI Input**: `@/components/ui/kibo-ui/ai/input` - 音声入力・モデル選択・自動リサイズ
- **AI Conversation**: `@/components/ui/kibo-ui/ai/conversation` - 自動スクロール・最適化されたチャット表示
- **AI Message**: `@/components/ui/kibo-ui/ai/message` - 統一メッセージレイアウト・アバター表示
- **AI Response**: `@/components/ui/kibo-ui/ai/response` - マークダウン・コードハイライト・セキュリティ
- **AI Branch**: `@/components/ui/kibo-ui/ai/branch` - 会話分岐・複数レスポンス対応

### タスク管理機能 (kiboUI) - ✅ 統合済み
- **Kanban**: `@/components/ui/kibo-ui/kanban` - ドラッグ&ドロップ・アクセシビリティ対応・テーマ統合
- **Table**: `@/components/ui/kibo-ui/table` - @tanstack/react-table統合・Jotaiソート・フィルタリング対応

### 高度な機能 (kiboUI) - 🔄 必要に応じて追加
- **ガントチャート**: `@/components/ui/kibo-ui/gantt` (プロジェクト管理画面)
- **カラーピッカー**: `@/components/ui/kibo-ui/color-picker` (設定画面)
- **ドロップゾーン**: `@/components/ui/kibo-ui/dropzone` (ファイルアップロード)

## Integration Benefits

- ✅ **AI Input**: Voice input, model selection, auto-resize implemented
- ✅ **AI Conversation**: Auto-scroll, scroll-to-bottom implemented  
- ✅ **AI Message**: Unified layout with avatars implemented
- ✅ **AI Response**: Markdown, code highlighting, security implemented
- ✅ **AI Branch**: Multi-variant responses, navigation implemented
- 🔄 **Advanced Features**: Source, suggestion, tool components available for future use