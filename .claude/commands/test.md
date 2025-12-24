# テスト作成

指定されたコードに対するテストを作成してください。

## テスト駆動開発（TDD）アプローチ

1. **テストケースを定義**
   - 正常系
   - エラー系
   - エッジケース

2. **テストを実装**
   - Vitest使用
   - Testing Library使用（コンポーネント）

3. **テスト実行**
   - 単一ファイル: `npm run test -- [ファイルパス]`
   - 全体: `npm run test`

## テストパターン

### ユニットテスト
```typescript
import { describe, it, expect } from 'vitest'

describe('関数名', () => {
  it('正常系: 期待する動作', () => {
    expect(result).toBe(expected)
  })

  it('エラー系: エラーハンドリング', () => {
    expect(() => fn()).toThrow()
  })
})
```

### コンポーネントテスト
```typescript
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })
})
```

## 出力形式

```markdown
## テスト作成完了

### 作成したテスト
- [ファイルパス]: [テスト内容]

### カバレッジ
- 正常系: X件
- エラー系: X件
- エッジケース: X件
```
