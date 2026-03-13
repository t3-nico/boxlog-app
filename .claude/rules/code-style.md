---
paths:
  - 'src/**/*.{ts,tsx}'
---

# コーディング規約

## 型定義

具体的な型を使い、型安全性を最大化する。

- union型のvariance問題には `as never`（`as any` 禁止）
- `unknown` は型ガードと組み合わせる場合のみ許可

## スタイリング

セマンティックトークンでダークモード対応を自動化する。

```tsx
// ✅ セマンティックトークン
<div className="bg-card text-foreground border-border" />

// ❌ 直接カラー、style属性
<div className="text-blue-500" />
```

## UIコンポーネント

Storybookに記載されているパターンのみ使用。新パターンは先にStory追加。

## ログ出力

`@/lib/logger` を使用。`console.log` は本番コード禁止。

## Server Component vs Client Component

Server Component をデフォルト。useState / useEffect / イベントハンドラ / ブラウザAPIが必要な場合のみ Client。

## セキュリティ

- 認証必須エンドポイントは `protectedProcedure`
- `ctx.userId` でデータアクセスを制限
- `dangerouslySetInnerHTML` 禁止
