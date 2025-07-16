# kiboUI 導入ガイド

## 📋 導入前チェックリスト

### ✅ **環境準備完了項目**

#### **1. 依存関係**
- [x] **shadcn/ui**: 基本UIコンポーネント完全導入済み
- [x] **Tailwind CSS v4**: カスタムテーマシステム構築済み
- [x] **TypeScript**: 厳密型チェック設定完了
- [x] **Radix UI**: shadcn/uiの基盤として導入済み

#### **2. プロジェクト構造**
- [x] **命名規則**: 統一ガイドライン策定済み (`/docs/NAMING_CONVENTIONS.md`)
- [x] **ディレクトリ構造**: `src/components/ui/kibo-ui/` 分離準備完了
- [x] **Import/Export**: パス設定とエイリアス設定完了

#### **3. 開発環境設定**
- [x] **TypeScript設定**: kiboUI用パス設定追加
- [x] **ESLint設定**: kiboUIディレクトリ用ルール設定
- [x] **Prettier設定**: kiboUI用フォーマットルール設定  
- [x] **テスト環境**: Vitest + jsdom + testing-library設定完了

#### **4. ドキュメント**
- [x] **命名規則ガイド**: 詳細策定完了
- [x] **段階的導入戦略**: フェーズ別計画策定
- [x] **コンポーネント使用ルール**: shadcn/ui vs kiboUI棲み分け明確化

---

## 🚀 kiboUI導入手順

### **フェーズ1: 個別コンポーネント追加**

#### **推奨導入順序**
```bash
# 1. カラーピッカー（設定画面用、影響範囲最小）
npx kibo-ui add color-picker

# 2. AI Input（チャット機能用、独立性高い）
npx kibo-ui add ai-input

# 3. Gantt（プロジェクト管理画面用、複雑だが高価値）
npx kibo-ui add gantt

# 4. Dropzone（ファイルアップロード用、必要に応じて）
npx kibo-ui add dropzone
```

#### **各コンポーネント導入後の確認事項**
```bash
# ビルド確認
npm run build

# テスト実行
npm run test

# リント確認
npm run lint

# 型チェック
npx tsc --noEmit
```

### **フェーズ2: 統合とテスト**

#### **統合確認項目**
- [ ] shadcn/uiとのスタイル競合チェック
- [ ] ダークモード対応確認
- [ ] レスポンシブデザイン確認
- [ ] アクセシビリティテスト
- [ ] パフォーマンステスト

---

## 🎯 コンポーネント別使用ガイド

### **1. Color Picker**
```tsx
// 使用場所: タグ設定、テーマ設定
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker'

function TagSettings() {
  const [color, setColor] = useState('#3b82f6')
  
  return (
    <ColorPicker
      value={color}
      onChange={(newColor) => setColor(newColor)}
    />
  )
}
```

**特徴:**
- HSL、RGB、HEX対応
- EyeDropper API対応（ブラウザ対応時）
- アルファチャンネル対応

### **2. AI Input**
```tsx
// 使用場所: チャット機能、AI対話
import { AIInput } from '@/components/ui/kibo-ui/ai-input'

function ChatInterface() {
  const handleSubmit = (message: string) => {
    // AI API呼び出し
  }
  
  return (
    <AIInput
      onSubmit={handleSubmit}
      placeholder="AIに質問してください..."
    />
  )
}
```

**特徴:**
- ストリーミングレスポンス対応
- マークダウンレンダリング
- 履歴管理機能

### **3. Gantt Chart**
```tsx
// 使用場所: プロジェクト管理画面
import { Gantt } from '@/components/ui/kibo-ui/gantt'

function ProjectManagement() {
  const tasks = [
    { id: '1', name: 'Task 1', start: '2024-01-01', end: '2024-01-15' },
    // ...
  ]
  
  return (
    <Gantt
      data={tasks}
      onTaskUpdate={handleTaskUpdate}
    />
  )
}
```

**特徴:**
- ドラッグ&ドロップ対応
- 依存関係表示
- タイムライン調整

### **4. Dropzone**
```tsx
// 使用場所: ファイルアップロード
import { Dropzone } from '@/components/ui/kibo-ui/dropzone'

function FileUpload() {
  const handleDrop = (files: File[]) => {
    // ファイル処理
  }
  
  return (
    <Dropzone
      onDrop={handleDrop}
      accept="image/*"
      maxFiles={5}
    />
  )
}
```

**特徴:**
- 複数ファイル対応
- ファイル形式制限
- プレビュー機能

---

## ⚠️ 注意事項とベストプラクティス

### **1. インポート規則**
```tsx
// ✅ 正しい
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker'
import { Button } from '@/components/ui/button' // shadcn/ui

// ❌ 避ける
import { ColorPicker } from '@/components/ui/color-picker' // 混在
```

### **2. 型安全性**
```tsx
// ✅ 適切な型定義
interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
}

// ❌ any型は避ける
const handleChange = (value: any) => { ... }
```

### **3. スタイリング**
```tsx
// ✅ CSS変数とTailwindの組み合わせ
<div className="bg-background text-foreground">
  <ColorPicker className="w-full" />
</div>

// ❌ ハードコードされたスタイル
<div style={{ backgroundColor: '#ffffff' }}>
```

---

## 🔧 トラブルシューティング

### **よくある問題と解決策**

#### **1. ビルドエラー**

**問題**: `Module not found: Can't resolve '@/components/ui/kibo-ui/...'`
```bash
Error: Cannot resolve module '@/components/ui/kibo-ui/color-picker'
```

**解決策**:
```bash
# 1. コンポーネントが正しくインストールされているか確認
ls src/components/ui/kibo-ui/

# 2. TypeScript設定を確認
npx tsc --showConfig

# 3. Next.js再起動
npm run dev
```

#### **2. スタイル競合**

**問題**: kiboUIコンポーネントのスタイルが適用されない

**解決策**:
```css
/* src/styles/tailwind.css で優先度調整 */
@layer components {
  .kibo-ui-override {
    @apply !important;
  }
}
```

#### **3. TypeScript型エラー**

**問題**: `Property 'EyeDropper' does not exist on type 'Window'`

**解決策**:
```typescript
// src/types/global.d.ts
interface Window {
  EyeDropper?: {
    new(): {
      open(): Promise<{ sRGBHex: string }>
    }
  }
}
```

#### **4. テスト失敗**

**問題**: `ReferenceError: EyeDropper is not defined`

**解決策**:
```typescript
// src/test/setup.ts (既に設定済み)
Object.defineProperty(window, 'EyeDropper', {
  writable: true,
  value: class MockEyeDropper {
    async open() {
      return { sRGBHex: '#ff0000' }
    }
  },
})
```

#### **5. パフォーマンス問題**

**問題**: kiboUIコンポーネントで描画が重い

**解決策**:
```tsx
// React.memoを活用
import { memo } from 'react'

const OptimizedGantt = memo(Gantt)

// 仮想化の実装
import { FixedSizeList } from 'react-window'
```

---

## 📊 パフォーマンス最適化

### **1. バンドルサイズ最適化**
```bash
# バンドル分析
npm run build
npx @next/bundle-analyzer

# Tree-shaking確認
grep -r "import.*kibo-ui" src/
```

### **2. レンダリング最適化**
```tsx
// useMemoとuseCallbackの活用
const memoizedData = useMemo(() => 
  processGanttData(tasks), [tasks]
)

const handleTaskUpdate = useCallback((task) => {
  updateTask(task)
}, [updateTask])
```

### **3. 非同期読み込み**
```tsx
// 動的インポートでコードスプリッティング
const LazyGantt = lazy(() => 
  import('@/components/ui/kibo-ui/gantt').then(module => ({
    default: module.Gantt
  }))
)
```

---

## 🧪 テスト戦略

### **1. 単体テスト**
```tsx
// kiboUIコンポーネントのテスト例
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker'

test('ColorPicker onChange callback', () => {
  const handleChange = vi.fn()
  render(<ColorPicker onChange={handleChange} />)
  
  // テスト実装
})
```

### **2. 統合テスト**
```tsx
// shadcn/ui + kiboUI統合テスト
test('Dialog with ColorPicker integration', () => {
  render(
    <Dialog>
      <DialogContent>
        <ColorPicker />
      </DialogContent>
    </Dialog>
  )
  
  // 統合動作確認
})
```

### **3. ビジュアルリグレッションテスト**
```bash
# Storybook + Chromatic (推奨)
npm install --save-dev @storybook/react
```

---

## 📈 メンテナンス

### **1. 定期更新**
```bash
# kiboUIバージョン確認
npm list | grep kibo

# 依存関係更新
npm update color radix-ui

# セキュリティ監査
npm audit
```

### **2. パフォーマンス監視**
```tsx
// React DevTools Profilerでの監視
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render time:', actualDuration)
}

<Profiler id="KiboUI" onRender={onRenderCallback}>
  <ColorPicker />
</Profiler>
```

### **3. アクセシビリティ監査**
```bash
# axe-core での自動テスト
npm install --save-dev @axe-core/react
```

---

## 🎓 追加リソース

### **公式ドキュメント**
- [Kibo UI 公式サイト](https://www.kibo-ui.com/)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
- [Radix UI ドキュメント](https://www.radix-ui.com/)

### **コミュニティ**
- GitHub Issues: バグ報告・機能要望
- Discord/Slack: コミュニティサポート

### **プロジェクト内ドキュメント**
- `/docs/NAMING_CONVENTIONS.md`: 命名規則ガイド
- `CLAUDE.md`: 開発ガイドライン
- `/docs/KIBO_UI_INTEGRATION_GUIDE.md`: このドキュメント

---

## ✅ 導入完了チェックリスト

### **技術的準備**
- [ ] 環境設定完了（TypeScript, ESLint, Prettier, テスト）
- [ ] 命名規則ガイドライン策定
- [ ] コンポーネント分離戦略決定

### **導入実行**
- [ ] 第1コンポーネント導入（Color Picker推奨）
- [ ] ビルド・テスト確認
- [ ] 第2コンポーネント導入（AI Input推奨）
- [ ] 統合テスト実行

### **品質保証**
- [ ] アクセシビリティテスト
- [ ] パフォーマンステスト
- [ ] クロスブラウザテスト
- [ ] レスポンシブテスト

### **ドキュメント**
- [ ] 使用方法ドキュメント作成
- [ ] トラブルシューティングガイド更新
- [ ] チーム共有・レビュー完了

---

**🎯 これで kiboUI の安全で段階的な導入が可能です！**