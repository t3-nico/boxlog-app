# Context API vs Zustand 判断ガイド

> **詳細ドキュメントはStorybookに移行しました。**
> `npm run storybook` → サイドバー「Docs/アーキテクチャ/状態管理」を参照してください。
>
> 含まれる内容: 判断フローチャート、Zustand基本パターン、selector必須パターン、Context APIの正当な使用ケース、パフォーマンスの違い

---

## クイックリファレンス

**原則**: 新規状態管理は**Zustand**を優先する。

| 条件                                      | 選択        |
| ----------------------------------------- | ----------- |
| 外部ライブラリのContext                   | Context API |
| 頻繁な更新 / 多数参照 / 永続化 / DevTools | Zustand     |
| それ以外                                  | Zustand推奨 |

---

**📖 最終更新**: 2026-02-12 | **バージョン**: v2.0 - Storybook MDX版へ移行
