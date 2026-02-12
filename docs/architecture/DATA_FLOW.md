# データの流れ

> **詳細ドキュメントはStorybookに移行しました。**
> `npm run storybook` → サイドバー「Docs/アーキテクチャ/データフロー」を参照してください。
>
> 含まれる内容: 全体アーキテクチャ図、各レイヤーの役割（Component→tRPC→Service→Supabase→RLS）、状態管理の使い分け、楽観的更新フロー

---

## クイックリファレンス

```
[ユーザー操作] → [Component] → [tRPC Client] → [tRPC Router] → [Service] → [Supabase] → [PostgreSQL+RLS]
```

---

**📖 最終更新**: 2026-02-12 | **バージョン**: v2.0 - Storybook MDX版へ移行
