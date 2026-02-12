# i18n 実装ガイド

> **詳細ドキュメントはStorybookに移行しました。**
> `npm run storybook` → サイドバー「Docs/実装ガイド/i18n」を参照してください。
>
> 含まれる内容: ディレクトリ構造、命名規則（ファイル名・キー構造）、Server/Client Component使用法、ネームスペース一覧、追加手順、チェックリスト

---

## クイックリファレンス

```typescript
// Server Component
const t = await getTranslations({ locale });
t('calendar.toolbar.today');

// Client Component
const t = useTranslations();
t('calendar.toolbar.today');
```

```bash
npm run i18n:check    # 翻訳キーの差分チェック
npm run i18n:unused   # 未使用キーの検出
```

---

**📖 最終更新**: 2026-02-12 | **バージョン**: v2.0 - Storybook MDX版へ移行
