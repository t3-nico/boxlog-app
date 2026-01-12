# Testing Strategy

BoxLogのテスト戦略とCI/CD構成のドキュメント

## 概要

### テスト種類の配分

| 種類 | 目的 | ツール | 実行タイミング |
|------|------|--------|--------------|
| **Unit** | ドメインロジック、バリデーション、分岐 | Vitest | PR時 |
| **Integration** | API + DB + 権限 | Vitest + Supabase | PR時（関連ファイル変更時） |
| **E2E** | ユーザーフロー | Playwright | PR時（軽量）/ main後（フル） |

### テストピラミッド

```
        /\
       /  \      E2E (最小限)
      /----\     - 主要シナリオのみ
     /      \    - クロスブラウザ
    /--------\   Integration (重要)
   /          \  - tRPC routers
  /            \ - RLS policies
 /--------------\  Unit (多め)
/                \ - hooks, utils, stores
```

## CI構成

### 3段階ゲート

#### Gate 0: 速い品質ゲート（必須・3分以内）

```yaml
# ci.yml
- lint
- typecheck
- unit-tests
```

#### Gate 1: 中品質ゲート（必須・10分以内）

```yaml
# coverage.yml + integration.yml
- カバレッジ計測
- カバレッジ「低下のみ」Fail
- 差分カバレッジ警告（重要領域80%必須）
- Integrationテスト（Supabase起動）
```

#### Gate 2: 重い・本番相当

```yaml
# e2e.yml (PR時)
- Chromium + Firefox のみ

# e2e-full-post-merge.yml (main後)
- 全6ブラウザ
- 失敗時にIssue自動作成
```

## カバレッジ戦略

### ルール

1. **全体カバレッジは「低下のみ」Fail**
   - mainブランチの値をbaseline
   - PRでbaselineを下回ったらFail
   - 固定閾値（80%等）は使わない

2. **差分カバレッジは「重要領域のみ」厳格**
   - 重要領域: `src/features/auth/`, `src/server/`, `src/lib/supabase/`
   - これらは80%必須（Fail）
   - その他は70%で警告のみ

### ローカルでの確認

```bash
# カバレッジサマリー表示
npm run test:coverage:summary

# 差分カバレッジ（変更ファイルのみ）
npm run test:diff-coverage
```

## ファイル構成

```
src/
├── test/
│   ├── setup.ts              # グローバルモック設定
│   ├── trpc-test-helpers.ts  # tRPCテストユーティリティ
│   ├── integration/          # 統合テスト
│   │   └── *.integration.test.ts
│   └── e2e/                  # E2Eテスト
│       └── *.spec.ts
│
├── features/
│   └── */
│       ├── hooks/*.test.ts   # フックのテスト
│       ├── stores/*.test.ts  # ストアのテスト
│       └── utils/*.test.ts   # ユーティリティのテスト
│
└── server/
    ├── api/routers/
    │   └── */__tests__/*.test.ts  # ルーターのテスト
    └── services/
        └── */__tests__/*.test.ts  # サービスのテスト
```

## テストパターン

### hooks のテスト

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useMyHook', () => {
  it('should update state', async () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.doSomething();
    });

    await waitFor(() => {
      expect(result.current.value).toBe('expected');
    });
  });
});
```

### stores のテスト

```typescript
import { useMyStore } from './useMyStore';

describe('useMyStore', () => {
  beforeEach(() => {
    useMyStore.setState({ /* initial state */ });
  });

  it('should update state', () => {
    useMyStore.getState().someAction();
    expect(useMyStore.getState().someValue).toBe('expected');
  });
});
```

### tRPC routers のテスト

```typescript
import { createTestCaller, createAuthenticatedContext } from '@/test/trpc-test-helpers';

describe('myRouter', () => {
  it('should return data for authenticated user', async () => {
    const ctx = createAuthenticatedContext('user-id');
    const caller = createTestCaller(myRouter, ctx);

    const result = await caller.list();

    expect(result).toBeDefined();
  });
});
```

### Integration テスト

```typescript
// src/test/integration/my.integration.test.ts

describe.skipIf(SKIP_INTEGRATION)('My Integration', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  afterAll(async () => {
    // クリーンアップ
  });

  it('should work with real database', async () => {
    // 実際のDBを使用したテスト
  });
});
```

## 実行コマンド

| コマンド | 説明 |
|---------|------|
| `npm test` | インタラクティブモード |
| `npm run test:run` | ワンショット実行 |
| `npm run test:coverage` | カバレッジ計測 |
| `npm run test:coverage:summary` | カバレッジサマリー表示 |
| `npm run test:diff-coverage` | 差分カバレッジ |
| `npm run test:integration` | 統合テスト |
| `npm run test:e2e` | E2Eテスト |
| `npm run test:e2e:headed` | E2E（ブラウザ表示） |

## 障害パターンとテスト優先度

SaaSで最も障害を起こしやすい領域を優先:

| 領域 | リスク | テスト種類 |
|------|--------|-----------|
| **DB更新** | データ不整合 | Integration |
| **権限/RLS** | 情報漏洩 | Integration |
| **認証** | セッション問題 | Integration + E2E |
| **時間計算** | タイムゾーン問題 | Unit |
| **UI操作** | UX問題 | E2E |

## 参考

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
