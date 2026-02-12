# エラーパターン辞書システム

> **詳細ドキュメントはStorybookに移行しました。**
> `npm run storybook` → サイドバー「Docs/アーキテクチャ/エラーパターン」を参照してください。
>
> 含まれる内容: エラーコード体系（7カテゴリ）、自動復旧戦略、React Hook使用法、Sentry連携、ベストプラクティス

---

## クイックリファレンス

```typescript
import { createAppError, ERROR_CODES } from '@/config/error-patterns';
import { handleError } from '@/lib/error-handler';

const error = createAppError('メッセージ', ERROR_CODES.NOT_FOUND, {
  source: 'service-name',
  context: { id: 'xxx' },
});
await handleError(error);
```

---

**📖 最終更新**: 2026-02-12 | **バージョン**: v2.0 - Storybook MDX版へ移行
