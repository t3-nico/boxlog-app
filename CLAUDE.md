# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🗣️ Communication Language

**IMPORTANT: Always respond in Japanese (日本語) unless specifically requested otherwise by the user.**

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

## Architecture Overview

This is a Next.js 14 application built with TypeScript, using App Router for routing. The application is a task management system called "BoxLog" with calendar, board, and table views.

### Key Technologies

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS v4 with custom theme system
- **UI Components**: shadcn/ui (Radix UI primitives), kiboUI (advanced components)
- **Authentication**: Supabase Auth with custom AuthContext
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Drag & Drop**: @dnd-kit for sortable interfaces, kiboUI Kanban for board views
- **Icons**: Heroicons, Lucide React
- **Command Palette**: shadcn/ui Command (cmdk-based)

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
  - `(app)/` - Main application routes (requires auth)
  - `(auth)/` - Authentication pages (login, signup, etc.)
  - `api/` - API routes for backend functionality
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and configurations
- `src/stores/` - Zustand state management
- `src/contexts/` - React contexts (auth, theme)
- `src/styles/` - Global styles and theme definitions
- `src/config/` - Configuration files

### 🏗️ Component Library Strategy

**CRITICAL: Always prefer existing library components over custom implementations.**

#### Component Selection Priority (MANDATORY)

1. **🥇 shadcn/ui (FIRST CHOICE)**
   - Check: https://ui.shadcn.com/docs/components
   - Use: `npx shadcn@latest add [component-name]`
   - Examples: Button, Dialog, Command, Select, Input, etc.

2. **🥈 kiboUI (ADVANCED FEATURES)**
   - Check: Available components for advanced functionality
   - Use: `npx kibo-ui add [component]`
   - Examples: AI components, Kanban boards, Advanced tables

3. **🥉 Custom Implementation (LAST RESORT)**
   - Only when: No suitable library component exists
   - Requirement: Must document why existing libraries are insufficient

#### Component Usage Rules

- **基本UI**: shadcn/ui を使用
- **AI機能**: kiboUI AI コンポーネント を使用 ✅ **統合完了**
- **高度な機能**: kiboUI を使用

### Authentication Flow

- Supabase Auth with SSR support
- Custom AuthContext in `src/contexts/AuthContext.tsx`
- Server-side client in `src/lib/supabase/server.ts`
- Client-side client in `src/lib/supabase/client.ts`
- Auth pages in `src/app/(auth)/`

### State Management

Primary state is managed through Zustand stores:

- `useSidebarStore` - Sidebar state, notifications, tags, smart folders
- `useBoxStore` - Task/box management and filtering
- Stores use persistence middleware for client-side storage

### Component Architecture

- **Sidebar**: Collapsible sidebar with dynamic sections
- **Tags**: Hierarchical tag system with 3-level nesting
- **Smart Folders**: Dynamic filtering rules for tasks
- **Theme Toggle**: Light/dark mode switching
- **Notifications**: Real-time notification system

### API Routes

- `/api/tags/` - Tag CRUD operations
- `/api/smart-folders/` - Smart folder management
- `/api/item-tags/` - Tag associations
- `/api/auth/refresh/` - Auth token refresh

### Key Features

1. **Multi-view System**: Calendar, Table, Board, and Stats views
2. **Hierarchical Tags**: 3-level tag nesting with custom colors and icons
3. **Smart Folders**: Rule-based task filtering
4. **Drag & Drop**: Sortable interfaces for tags and smart folders
5. **Responsive Design**: Mobile-first approach with sidebar collapse
6. **Real-time Updates**: Optimistic updates with React Query patterns

### Development Notes

- Use `src/config/sidebarConfig.ts` for sidebar menu configuration
- Tag icons are defined in `src/config/tagIcons.ts`
- **Theme colors should use CSS variables from the theme system**
- **Always test both light and dark mode implementations**
- **New components MUST support dual themes from the start**
- **Use `--tag-color` CSS variable for elements that need custom colors**
- Use TypeScript strictly - avoid `any` types where possible

### 🎨 Design System - 8px Grid Guidelines ✅ **実装完了**

**基本ルール**: 8pxグリッドシステムを基本とし、実用性を重視した柔軟な運用

#### ✅ **推奨値（優先順位順）**
1. **8pxの倍数**: 8px, 16px, 24px, 32px, 40px, 48px...
   - `p-2`, `p-4`, `p-6`, `p-8`, `p-10`, `p-12`
2. **実用的な値**: 4px, 12px, 20px（頻繁に使用される値）
   - `p-1`, `p-3`, `p-5`（例外として許可）

#### ❌ **避けるべき値**
- **半端な値**: 6px, 10px, 14px, 18px...
- `py-1.5` (6px), `px-2.5` (10px), `gap-1.5` (6px)

#### 🎯 **実装状況（2025-01-22完了）**
- ✅ **0.5px要素**: 完全除去（13ファイル修正）
- ✅ **1px要素**: w-1, h-1 → w-2, h-2 に統一
- ✅ **1.5px要素**: h-1.5, w-1.5 → h-2, w-2 に統一
- ✅ **3.5px要素**: w-3.5, h-3.5 → w-4, h-4 に統一
- ✅ **インラインpx値**: 動的値は適切に配置
- ✅ **CSS変数**: 8px基準で統一済み

#### 🎯 **実装ガイドライン**
- **新規コンポーネント**: 8pxの倍数を優先的に使用
- **既存コンポーネント**: 8pxグリッド準拠完了
- **例外**: `px-3` (12px) など使用頻度の高い値は実用性を重視
- **統一性**: 同じ用途のスペーシングは統一（例：ボタンパディング、カード間隔）

### 🎯 Development Workflow

- **ALWAYS run `npm run lint` before committing**
- **Test both light and dark modes for all new components**
- **Follow branch naming**: `feature/[name]`, `fix/[name]`, `refactor/[name]`
- **Use descriptive commit messages with proper prefixes**
- **Follow 8px grid guidelines for new components**

### 🤖 AI Chatbot System ✅ **実装完了**

BoxLogアプリケーション専用のRAG（Retrieval Augmented Generation）AIチャットボットシステムを実装しました。

#### **コア機能**
- **RAG検索**: GitHub API経由でt3-nico/boxlog-webリポジトリから関連情報を検索
- **多言語対応**: 質問言語を自動検出（日本語↔英語）で適切な言語で回答
- **コスト最適化**: GPT-3.5 Turbo使用、600トークン制限、1時間キャッシュ
- **ストリーミング**: Vercel AI SDK useChat hookとの完全統合

#### **レイアウトシステム**
- **3カラム構成**: 左サイドバー(256px) | メインコンテンツ(可変) | AIチャット(320px)
- **Googleカレンダー風**: 全領域が同時表示される直感的なレイアウト
- **完全レスポンシブ**: 全画面サイズで最適表示
- **ゼロパディング**: メインコンテンツは端から端まで完全表示

#### **UI/UXデザイン**
- **統一アイコン**: bot-message-square で全インターフェース統一
- **ユーザーアバター**: アカウント設定の絵文字/画像を連携表示
- **Neutralカラー**: グレートーンでBoxLog全体デザインと統一
- **アクセシビリティ**: ARIA対応、キーボードナビゲーション

#### **技術実装**
```typescript
// 言語自動検出
function isJapanese(text: string): boolean {
  const hiraganaKatakana = /[\u3040-\u309F\u30A0-\u30FF]/
  // ひらがな・カタカナの存在で日本語判定（中国語除外）
}

// RAG検索
async function fetchRelevantFiles(query: string): Promise<CodeContext> {
  // GitHub Search API でリポジトリ検索
  // 関連ファイルの内容取得
  // システムプロンプトに組み込み
}
```

#### **コンポーネント配置**
- **AIChatSidebar**: `/src/components/ai-chat-sidebar.tsx` - 汎用AIチャット
- **CodebaseAIChat**: `/src/components/codebase-ai-chat.tsx` - BoxLog専用サポート
- **API Route**: `/src/app/api/chat/codebase/route.ts` - RAGエンドポイント
- **Layout Integration**: `application-layout-new.tsx` - 3カラムレイアウト

#### **使用方法**
1. 右サイドバーのbotアイコンをクリック
2. 日本語/英語で質問入力
3. BoxLog機能について自動的にリポジトリから検索して回答
4. OpenAI未設定時はモック応答で動作確認可能

### 📚 Documentation

Detailed documentation has been moved to specialized files and is automatically loaded by Claude Code via `.claude/settings.local.json`:

- **Migration Guide**: `docs/migration/shadcn-ui.md` - shadcn/ui migration patterns
- **Component Guide**: `docs/components/kibo-ui.md` - kiboUI integration patterns
- **Theme System**: `docs/theming/theme-system.md` - Dual theme development rules
- **Git Workflow**: `docs/development/git-workflow.md` - Development practices
- **Deployment**: `docs/deployment/vercel.md` - Vercel deployment guide
- **Testing**: `docs/testing/guidelines.md` - Testing patterns and setup
- **CI/CD**: `docs/ci-cd/setup.md` - Vitest and GitHub Actions setup guide
- **GitHub Setup**: `docs/ci-cd/github-setup.md` - Step-by-step GitHub configuration
- **Vercel Integration**: `docs/ci-cd/vercel-integration.md` - Vercel deployment workflow
- **CI/CD Status**: `docs/ci-cd/current-status.md` - Current CI/CD configuration status
- **Database**: `docs/database/schema.md` - Database schema and relationships
- **Troubleshooting**: `docs/troubleshooting/common-issues.md` - Common issues and solutions
- **Authentication**: `docs/authentication/setup-guide.md` - Authentication system setup and usage guide

> **Note**: When adding new documentation files, update the `claudeMd` array in `.claude/settings.local.json` to ensure automatic loading by Claude Code.

### 🚀 Quick Start Patterns

#### Common Component Patterns

```tsx
// shadcn/ui Button
<Button variant="outline" onClick={onClose}>Cancel</Button>
<Button variant="ghost" onClick={handleAction}>Action</Button>

// shadcn/ui Dialog
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// shadcn/ui Select (note: onValueChange instead of onChange)
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

#### Theme Support Pattern

```tsx
// ✅ Good: Supports both themes automatically
<div className="bg-white text-black border border-gray-200 hover:bg-gray-50">
  Content
</div>

// ✅ Good: Custom color preserved
<div style={{'--tag-color': '#ef4444'}} className="tag-icon">
  <TagIcon className="w-4 h-4" />
</div>
```

#### Common Migration Patterns

```tsx
// shadcn/ui migrations
plain={true} → variant="ghost"
outline={true} → variant="outline"
onChange={setValue} → onValueChange={setValue}
setError(error) → setError(error.message)
```

### 🎭 Remember

This CLAUDE.md is a **living document** - it should evolve with the codebase and become more valuable over time through continuous improvements and insights gained during development.

---

*Last Major Update: 2025-01-17 - Restructured for conciseness with detailed docs moved to specialized files*
*Current Version: v2.0 - Simplified overview with comprehensive documentation system*