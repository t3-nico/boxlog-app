# 品質・テスト・パフォーマンス

## Lighthouse CI（PR必須）

| 指標           | 基準  | ブロッキング   |
| -------------- | ----- | -------------- |
| Performance    | >= 80 | Yes            |
| Accessibility  | >= 90 | Yes            |
| Best Practices | >= 85 | Yes            |
| SEO            | -     | No（警告のみ） |

実行: `npm run lighthouse:check`

## テスト

テスト対象の優先順位:

1. ビジネスロジック（Service層）
2. カスタムフック（状態管理）
3. 複雑なコンポーネント
4. ユーティリティ関数

```bash
npm run test          # 全体実行
npm run test -- path  # 特定ファイル
```

**詳細**: `.claude/skills/test/SKILL.md`

## アクセシビリティ

```tsx
// ✅ アイコンボタンにaria-label
<Button aria-label="Close dialog" size="icon"><X /></Button>

// ✅ フォームでlabel紐付け
<Label htmlFor="email">Email</Label>
<Input id="email" />

// ✅ タッチターゲット最小44x44px
<Button className="min-h-11 min-w-11" />
```

- 画像には必ず `alt` 属性を設定

**詳細**: `.claude/skills/a11y/SKILL.md`

## パフォーマンス

**p95だけを見る。平均は判断に使わない。**

### React最適化

```typescript
// ✅ 高コストな計算をメモ化
const sorted = useMemo(() => heavySort(items), [items]);

// ✅ 子に渡すコールバックを安定化
const handleClick = useCallback(() => { ... }, [dep]);

// ✅ 重いコンポーネントをメモ化
const MemoizedChart = React.memo(Chart);
```

最適化が**不要**: 単純なコンポーネント、propsが毎回変わる場合

**詳細**: `.claude/skills/react-best-practices/SKILL.md`

### 速度指標（p95目標）

| 指標            | 目標     |
| --------------- | -------- |
| **LCP**         | <= 2.5s  |
| **INP**         | <= 200ms |
| **API latency** | <= 300ms |
| **DBクエリ**    | <= 100ms |

### 行動ルール

- p95が悪化 → 必ずIssueを作成
- p95が良化 → 正解パターンとして記録
- 主要導線エラー率 < 0.1% を維持
