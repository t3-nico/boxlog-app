# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🗣️ Communication Language

**IMPORTANT: Always respond in Japanese (日本語) unless specifically requested otherwise by the user.**

## 📚 Documentation Location

**重要: 主要なドキュメントはcompassリポジトリで一元管理されています。**

詳細なドキュメントは以下の場所を参照してください：
- **メインドキュメント**: `compass/knowledge/app-docs/CLAUDE.md`
- **技術ドキュメント**: `compass/knowledge/app-docs/`
- **アーキテクチャ**: `compass/architecture/`
- **設計システム**: `compass/design-system/`

## 🔄 Compass Submodule

このリポジトリにはcompassサブモジュールが統合されており、以下のようにアクセス可能です：

```bash
# Compassの最新情報を取得
git submodule update --remote

# Compass内で作業
cd compass
git status
git add .
git commit -m "Update documentation"
git push origin dev
```

## 🚀 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

## 🏗️ Architecture

This is a Next.js 14 application with TypeScript, integrated with the compass knowledge management system for documentation and shared resources.

### Key Technologies

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **UI Components**: shadcn/ui (primary), kiboUI (advanced features)
- **Documentation**: Compass submodule for centralized knowledge management
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 with 8px grid system

### Component Priority

1. **🥇 shadcn/ui (FIRST CHOICE)** - Basic UI components
2. **🥈 kiboUI (ADVANCED FEATURES)** - AI components, Kanban, etc.
3. **🥉 Custom Implementation (LAST RESORT)** - Only when no library option exists

---

*For complete documentation, refer to `compass/knowledge/app-docs/CLAUDE.md`*
*Last Updated: 2025-01-28*