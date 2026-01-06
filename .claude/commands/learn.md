# 学習・概念解説

特定のツール、パターン、概念について解説し、ドキュメント化する。

## 目的

開発者が「なぜこうするのか」を理解できるよう、概念や設計思想を説明する。
説明は `docs/learning/` に保存して、後から参照できるようにする。

## 解説可能なトピック

### ツール

- **Next.js**: App Router、Server Components、Route Handlers
- **tRPC**: 型安全なAPI、プロシージャ、コンテキスト
- **Zustand**: 状態管理、Store設計、永続化
- **Supabase**: 認証、RLS、リアルタイム
- **TanStack Query**: キャッシング、ミューテーション、楽観的更新

### パターン

- **Service層パターン**: ビジネスロジックの分離
- **Repository パターン**: データアクセスの抽象化
- **Feature-based構造**: 機能ごとのディレクトリ分割

### 概念

- **型安全性**: TypeScript strict mode、Zodバリデーション
- **楽観的更新**: UX向上のためのテクニック
- **RLS (Row Level Security)**: 行レベルのアクセス制御

## 解説の形式

```markdown
# [トピック名]

## 一言で言うと

〇〇のための〇〇。

## なぜ必要か

- 問題: 〇〇がないと〇〇になる
- 解決: 〇〇を使うことで〇〇できる

## BoxLogでの使い方

- どのファイルで使っているか
- 具体的なコード例

## GAFAでの採用例

- Googleの〇〇でも採用
- Metaの〇〇パターンに準拠

## 関連リンク

- [公式ドキュメント](url)
- [参考記事](url)
```

## 保存先

解説ドキュメントは以下に保存：

- `docs/learning/CONCEPTS.md` - 概念の解説
- `docs/learning/[TOPIC].md` - 個別トピックの詳細

## 使い方の例

```
/learn tRPC
/learn Zustand
/learn 楽観的更新
/learn Service層パターン
```
