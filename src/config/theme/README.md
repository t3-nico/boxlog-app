# BoxLog デザインシステム

BoxLogアプリケーションの統一されたUIを実現するための包括的なデザインシステムです。

## 🎯 デザイン哲学

### コアプリンシプル

1. **シンプル・実用的・迷わない**
   - 最小限の選択肢で最大の効果
   - 明確な使い分けルール
   - 開発者の認知負荷を軽減

2. **8pxグリッドシステム**
   - 一貫したスペーシング
   - スケーラブルなデザイン
   - デバイス間の統一感

3. **プロダクティビティ・ファースト**
   - タスク管理に最適化
   - 視覚的ノイズの削減
   - 高速な意思決定をサポート

4. **アクセシビリティ**
   - WCAG 2.1 AA準拠
   - ダーク・ライトモード対応
   - キーボードナビゲーション対応

## 🏗️ システム構成

```
src/config/theme/
├── README.md           # このファイル
├── index.ts           # 統一エクスポート
├── types.ts           # TypeScript型定義
├── typography.ts      # タイポグラフィシステム
├── spacing.ts         # スペーシングシステム  
├── layout.ts          # レイアウトシステム
├── colors.ts          # カラーシステム
├── icons.ts           # アイコンシステム
├── rounded.ts         # 角丸・境界線システム
├── animations.ts      # アニメーションシステム
└── elevation.ts       # エレベーションシステム
```

## 📝 タイポグラフィシステム

### 見出し階層（heading）

```typescript
import { heading } from '@/config/theme'

// ページタイトル（1ページに1つ）
<h1 className={heading.h1}>ダッシュボード</h1>

// セクションタイトル（大きな区切り）
<h2 className={heading.h2}>今日のタスク</h2>

// サブセクション（セクション内の区切り）
<h3 className={heading.h3}>午前のタスク</h3>

// カードタイトル（カード・モーダルの見出し）
<h4 className={heading.h4}>タスクカードタイトル</h4>

// グループラベル（項目グループの見出し）
<h5 className={heading.h5}>基本設定</h5>

// 最小見出し（補助的な見出し）
<h6 className={heading.h6}>ヘルプ</h6>
```

### 本文テキスト（body）

```typescript
import { body } from '@/config/theme'

// 大きい本文（重要な説明文）
<p className={body.large}>重要なお知らせ</p>

// 通常本文（一般的なテキスト）
<p className={body.default}>通常のテキスト</p>

// 小さい本文（補足情報）
<p className={body.small}>補足説明</p>
```

### 特殊テキスト（special）

```typescript
import { special } from '@/config/theme'

// ラベル（フォームラベル、カテゴリ）
<label className={special.label}>ユーザー名</label>

// エラーテキスト（バリデーションエラー）
<span className={special.error}>必須項目です</span>

// キャプション（画像説明、注釈）
<small className={special.caption}>※注意事項</small>

// コード（コードスニペット、ID）
<code className={special.code}>npm install</code>
```

### リンクシステム（link）

```typescript
import { link } from '@/config/theme'

// デフォルトリンク（一般的なリンク）
<a className={link.default}>詳細を見る</a>

// プレーンリンク（下線なし）
<a className={link.plain}>ナビゲーション</a>

// ホバー強調リンク（ホバー時の変化が大きい）
<a className={link.hover}>インタラクティブ</a>

// インラインリンク（文章中のリンク）
<a className={link.inline}>こちら</a>

// ナビゲーションリンク（メニュー項目）
<a className={link.nav}>ダッシュボード</a>

// 警告リンク（削除、危険な操作）
<a className={link.danger}>削除する</a>

// 無効化リンク（クリック不可）
<span className={link.disabled}>利用不可</span>

// 外部リンク（アイコン付き）
<a className={link.external}>GitHub</a>
```

### リンク状態とパターン

```typescript
import { linkStates, linkPatterns } from '@/config/theme'

// リンク状態（追加クラスとして使用）
<a className={`${link.default} ${linkStates.visited}`}>訪問済みリンク</a>

// 特別なパターン
<a className={linkPatterns.buttonLink}>ボタン風リンク</a>
<nav className={linkPatterns.breadcrumb}>パンくずリスト</nav>
<a className={linkPatterns.tab}>タブリンク</a>
```

## 📏 スペーシングシステム

### 8pxグリッド基本値

```typescript
import { space } from '@/config/theme'

// 基本単位（8pxの倍数）
space.xs    // 8px  - 最小間隔
space.sm    // 16px - 小さな間隔
space.md    // 24px - 通常間隔
space.lg    // 32px - 大きな間隔
space.xl    // 48px - 最大間隔
```

### レスポンシブスペーシング

```typescript
import { patterns } from '@/config/theme'

// ページ余白（レスポンシブ）
<div className={patterns.page.responsive}>
  ページコンテンツ
</div>

// セクション間隔（デバイス別）
<section className={patterns.section.mobile}>
  モバイル用セクション
</section>
```

### 推奨コンポーネント

```typescript
import { Stack, Inline, Card, Grid } from '@/components/theme/Spacing'

// 縦並び（8pxグリッド準拠）
<Stack gap="md">
  <div>要素1</div>
  <div>要素2</div>
</Stack>

// 横並び（8pxグリッド準拠）
<Inline gap="sm">
  <button>ボタン1</button>
  <button>ボタン2</button>
</Inline>

// カード（バリアント別パディング）
<Card variant="comfortable">
  カードコンテンツ
</Card>

// グリッド（レスポンシブ）
<Grid cols={3} gap="default">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</Grid>
```

## 🎨 カラーシステム

### ブランドカラー

```typescript
import { colors } from '@/config/theme'

// プライマリ（メインブランド色）
colors.brand.primary     // #2563eb
colors.brand.secondary   // #64748b

// アクセント（強調色）
colors.brand.accent      // #8b5cf6
```

### セマンティックカラー

```typescript
// 成功（完了、正常）
colors.semantic.success.bg     // 背景色
colors.semantic.success.text   // テキスト色
colors.semantic.success.border // 境界線色

// エラー（失敗、警告）
colors.semantic.error.bg
colors.semantic.error.text
colors.semantic.error.border

// 警告（注意、確認）
colors.semantic.warning.bg
colors.semantic.warning.text
colors.semantic.warning.border

// 情報（通知、ヒント）
colors.semantic.info.bg
colors.semantic.info.text
colors.semantic.info.border
```

### ニュートラル（グレースケール）

```typescript
// 背景色階層
colors.neutral.bg.primary    // メイン背景
colors.neutral.bg.secondary  // カード背景
colors.neutral.bg.tertiary   // 補助背景

// テキスト色階層
colors.neutral.text.primary    // メインテキスト
colors.neutral.text.secondary  // 補助テキスト
colors.neutral.text.tertiary   // 薄いテキスト

// 境界線色
colors.neutral.border.default  // 通常境界線
colors.neutral.border.light    // 薄い境界線
colors.neutral.border.strong   // 強い境界線
```

## 🏗️ レイアウトシステム

### コンテナ

```typescript
import { layout } from '@/config/theme'

// レスポンシブコンテナ
<div className={layout.container.responsive}>
  コンテンツ
</div>

// 固定幅コンテナ
<div className={layout.container.fixed}>
  固定幅コンテンツ
</div>
```

### BoxLog 3カラムレイアウト

```typescript
import { columns } from '@/config/theme'

// サイドバー（固定幅）
<aside className={columns.sidebar}>
  ナビゲーション
</aside>

// メインコンテンツ（可変幅）
<main className={columns.main}>
  メインエリア
</main>

// 詳細パネル（固定幅）
<section className={columns.detail}>
  詳細情報
</section>
```

### Z-Index管理

```typescript
import { zIndex } from '@/config/theme'

// レイヤー構造（下から上へ）
zIndex.base      // 0   - 基本レイヤー
zIndex.elevated  // 10  - 浮上要素
zIndex.dropdown  // 100 - ドロップダウン
zIndex.modal     // 200 - モーダル
zIndex.toast     // 300 - トースト
zIndex.tooltip   // 400 - ツールチップ
```

## 🎭 アイコンシステム

### サイズ体系

```typescript
import { icons } from '@/config/theme'

// サイズバリエーション（8pxグリッド準拠）
icons.size.xs    // 16px - 小さなボタン内
icons.size.sm    // 20px - 通常ボタン内
icons.size.md    // 24px - 標準サイズ
icons.size.lg    // 32px - 大きな表示
icons.size.xl    // 48px - 特別な場面
```

### カラーバリエーション

```typescript
// アイコンカラー
icons.color.primary     // メインアイコン
icons.color.secondary   // 補助アイコン
icons.color.muted       // 薄いアイコン
icons.color.accent      // 強調アイコン
icons.color.success     // 成功アイコン
icons.color.error       // エラーアイコン
icons.color.warning     // 警告アイコン
```

### 使用例

```typescript
import { Icon } from '@/components/theme/Icon'

<Icon 
  name="plus" 
  size="md" 
  color="primary" 
  className="mr-2"
/>
```

## 🔘 角丸・境界線システム

### 角丸階層

```typescript
import { rounded } from '@/config/theme'

// 基本角丸（8pxグリッド準拠）
rounded.none    // 0px   - 角丸なし
rounded.sm      // 8px   - 小さな角丸
rounded.md      // 16px  - 通常角丸
rounded.lg      // 24px  - 大きな角丸
rounded.full    // 50%   - 完全円形
```

### コンポーネント別角丸

```typescript
// BoxLog統一ルール
rounded.boxlog.functional.button    // ボタン用
rounded.boxlog.functional.card      // カード用
rounded.boxlog.functional.input     // 入力フィールド用
rounded.boxlog.functional.modal     // モーダル用
```

### 境界線システム

```typescript
import { borders } from '@/config/theme'

// 基本境界線
borders.default  // 通常の境界線
borders.light    // 薄い境界線
borders.strong   // 強い境界線
borders.none     // 境界線なし
```

## ✨ アニメーションシステム

### トランジション

```typescript
import { transition } from '@/config/theme'

// 基本トランジション（200ms標準）
transition.default  // 汎用的な変化
transition.fast     // 高速変化（150ms）
transition.normal   // 通常変化（300ms）
transition.slow     // ゆっくり変化（500ms）

// 特化型トランジション
transition.colors    // 色のみ変化
transition.transform // 変形のみ
transition.opacity   // 透明度のみ
```

### ホバーエフェクト

```typescript
import { hover } from '@/config/theme'

// ホバーパターン
hover.scale        // 拡大効果
hover.lift         // 浮上効果
hover.glow         // 発光効果
hover.colorShift   // 色変化
hover.subtle       // 控えめ効果
hover.pronounced   // 強調効果
```

### ローディングアニメーション

```typescript
import { loading } from '@/config/theme'

// ローディング状態
loading.spinner    // スピナー
loading.pulse      // パルス（呼吸）
loading.fade       // フェード
loading.bounce     // バウンス
loading.skeleton   // スケルトン
```

### 表示アニメーション

```typescript
import { appear } from '@/config/theme'

// 要素の出現
appear.fadeIn      // フェードイン
appear.slideUp     // 下から上へ
appear.slideDown   // 上から下へ
appear.slideLeft   // 右から左へ
appear.slideRight  // 左から右へ
appear.zoomIn      // ズームイン
appear.zoomOut     // ズームアウト
```

### フィードバックアニメーション

```typescript
import { feedback } from '@/config/theme'

// ユーザーアクション反応
feedback.success   // 成功時
feedback.error     // エラー時
feedback.warning   // 警告時
feedback.info      // 情報表示時
feedback.press     // プレス感
feedback.shake     // 振動（エラー強調）
```

### アニメーションパターン

```typescript
import { patterns } from '@/config/theme/animations'

// よく使用される組み合わせ
patterns.smoothButton     // ボタン用アニメーション
patterns.cardHover        // カードホバー
patterns.modalAppear      // モーダル表示
patterns.listItemEnter    // リストアイテム追加
patterns.formSubmit       // フォーム送信
patterns.pageTransition   // ページ遷移
```

### アニメーションユーティリティ

```typescript
import { 
  getAnimationDelay, 
  getStagedAnimation, 
  combineAnimations 
} from '@/config/theme'

// 段階的アニメーション（リストなど）
const staggeredClasses = getStagedAnimation('fadeIn', 5)
// ['delay-0', 'delay-100', 'delay-200', 'delay-300', 'delay-400']

// アニメーション組み合わせ
const buttonAnimation = combineAnimations([
  transition.fast,
  hover.scale,
  feedback.press
])

// 条件的アニメーション
const conditionalAnimation = getConditionalAnimation(
  isLoading, 
  loading.spinner, 
  transition.default
)
```

## 🏔️ エレベーションシステム

### Slack型ハイブリッドアプローチ

BoxLogでは**境界線中心**のデザインを採用し、影は最小限に抑えています。

#### 境界線（常設UI用）

```typescript
import { borders } from '@/config/theme/elevation'

// 常設UI（カード、サイドバーなど）
borders.default  // 通常の境界線
borders.hover    // ホバー時の境界線
borders.active   // アクティブ状態
borders.focus    // フォーカス状態
borders.error    // エラー状態
borders.success  // 成功状態
```

#### 影（一時的UI用）

```typescript
import { elevation } from '@/config/theme'

// 一時的UI（モーダル、ドロップダウンなど）
elevation.none       // 影なし
elevation.subtle     // 微細な影
elevation.moderate   // 中程度の影
elevation.pronounced // 強い影
elevation.dramatic   // 劇的な影
```

### 使い分けルール

```typescript
// ✅ 常設UI → 境界線を使用
<div className={borders.default}>
  カードコンテンツ
</div>

// ✅ 一時的UI → 影を使用
<div className={elevation.moderate}>
  モーダルコンテンツ
</div>
```

### パターン例

```typescript
import { patterns } from '@/config/theme/elevation'

// よく使うパターン
patterns.card          // カード用境界線
patterns.button        // ボタン用スタイル
patterns.input         // 入力フィールド用
patterns.modal         // モーダル用影
patterns.dropdown      // ドロップダウン用影
patterns.tooltip       // ツールチップ用影
```

### エレベーションユーティリティ

```typescript
import { 
  getElevation, 
  getBorderForState, 
  getCardClasses,
  getTemporaryUIElevation 
} from '@/config/theme'

// 状態に応じたスタイル
const cardStyle = getCardClasses('hover')          // ホバー状態のカード
const inputStyle = getInputClasses('error')        // エラー状態の入力フィールド
const modalStyle = getTemporaryUIElevation('moderate') // モーダル用影

// UIタイプの判定
const elevationStyle = getElevation('card', 'permanent') // 境界線
const elevationStyle2 = getElevation('modal', 'temporary') // 影
```

## 🚀 使用方法

### 基本的なインポート

```typescript
// 個別インポート（推奨）
import { heading, body, link } from '@/config/theme'
import { space, patterns } from '@/config/theme'
import { colors } from '@/config/theme'

// 全体インポート
import { theme } from '@/config/theme'
```

### TypeScript型定義

```typescript
import type { 
  TypographyVariant,
  LinkVariant,
  TransitionVariant,
  ElevationLevel,
  AnimationPattern
} from '@/config/theme'

// コンポーネントProps
import type {
  TypographyProps,
  LinkProps,
  ButtonProps,
  AnimatedProps,
  ElevatedProps
} from '@/config/theme'
```

### React コンポーネント

```typescript
// 推奨: テーマ対応済みコンポーネント
import { 
  Typography, 
  Stack, 
  Inline, 
  Card,
  Icon 
} from '@/components/theme'

// 使用例
<Stack gap="md">
  <Typography variant="h1">
    ページタイトル
  </Typography>
  
  <Card variant="comfortable">
    <Typography variant="body">
      カードコンテンツ
    </Typography>
  </Card>
</Stack>
```

## 🛠️ ユーティリティ関数

### テーマアクセサ

```typescript
import { 
  getThemeValue,
  getSpacingClass,
  getTypographyClass,
  getColorClass 
} from '@/config/theme'

// 安全なテーマ値取得
const pageSpacing = getSpacingClass('page', 'default')
const headingClass = getTypographyClass('h1')
const primaryColor = getColorClass('brand', 'primary')
```

### 型ガード関数

```typescript
import { 
  isTypographyVariant,
  isSpacingCategory,
  isColorCategory 
} from '@/config/theme'

// 型安全な判定
if (isTypographyVariant(variant)) {
  // variant は TypographyVariant 型として扱える
}
```

## 🎨 実用的な使用例

### 基本的なページ構造

```typescript
import { 
  Stack,
  Card,
  Typography,
  Icon
} from '@/components/theme'
import { 
  heading, 
  body, 
  transition, 
  hover,
  elevation 
} from '@/config/theme'

export function DashboardPage() {
  return (
    <div className="p-6">
      <Stack gap="lg">
        {/* ページヘッダー */}
        <Typography variant="h1">
          ダッシュボード
        </Typography>
        
        {/* タスクセクション */}
        <Stack gap="md">
          <Typography variant="h2">
            今日のタスク
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <Card 
                key={task.id} 
                variant="default"
                className={`${transition.default} ${hover.lift}`}
              >
                <Stack gap="sm">
                  <Typography variant="h4">{task.title}</Typography>
                  <Typography variant="body">{task.description}</Typography>
                  <div className="flex items-center justify-between">
                    <Typography variant="caption">{task.dueDate}</Typography>
                    <Icon name="chevron-right" size="sm" />
                  </div>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </Stack>
    </div>
  )
}
```

### インタラクティブなボタンコンポーネント

```typescript
import { 
  transition, 
  hover, 
  feedback, 
  elevation 
} from '@/config/theme'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ variant = 'primary', loading, children }: ButtonProps) {
  const baseClasses = `
    px-4 py-2 rounded-lg font-medium
    ${transition.fast}
    ${hover.scale}
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `
  
  const variantClasses = {
    primary: `bg-blue-600 text-white ${hover.colorShift}`,
    secondary: `${elevation.subtle} text-gray-700 ${hover.lift}`
  }
  
  const loadingClasses = loading ? loading.pulse : ''
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${loadingClasses}`}
      disabled={loading}
    >
      {loading ? <Icon name="loader" className="animate-spin" /> : children}
    </button>
  )
}
```

### アニメーション付きモーダル

```typescript
import { 
  elevation, 
  appear, 
  transition 
} from '@/config/theme'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-black bg-opacity-50
      ${appear.fadeIn}
    `}>
      <div className={`
        bg-white rounded-lg p-6 max-w-md w-full mx-4
        ${elevation.dramatic}
        ${appear.zoomIn}
        ${transition.normal}
      `}>
        {children}
      </div>
    </div>
  )
}
```

## 📚 ベストプラクティス

### 1. 一貫性の維持

```typescript
// ✅ 良い例: システムの値を使用
<div className={space.md}>

// ❌ 悪い例: 任意の値を使用
<div className="mt-6">
```

### 2. 意味的な使い分け

```typescript
// ✅ 良い例: 用途に応じた選択
<h1 className={heading.h1}>ページタイトル</h1>
<h4 className={heading.h4}>カードタイトル</h4>

// ❌ 悪い例: 見た目だけで選択
<h1 className={heading.h4}>ページタイトル</h1>
```

### 3. レスポンシブ対応

```typescript
// ✅ 良い例: レスポンシブ考慮
<div className={patterns.page.responsive}>

// ❌ 悪い例: 固定値
<div className="p-4">
```

### 4. アクセシビリティ

```typescript
// ✅ 良い例: 色以外の情報も提供
<span className={`${colors.semantic.error.text} ${special.error}`}>
  <Icon name="alert-circle" />
  エラーメッセージ
</span>

// ❌ 悪い例: 色のみで情報伝達
<span className={colors.semantic.error.text}>
  エラーメッセージ
</span>
```

### 5. パフォーマンス最適化

```typescript
// ✅ 良い例: 必要な部分のみインポート
import { heading, body } from '@/config/theme'

// ❌ 悪い例: 全体インポート（使わない部分も含む）
import * as theme from '@/config/theme'
```

### 6. アニメーションの適切な使用

```typescript
// ✅ 良い例: 意味のあるアニメーション
<button className={`${transition.fast} ${hover.scale} ${feedback.press}`}>
  送信
</button>

// ❌ 悪い例: 過度なアニメーション
<div className="animate-bounce animate-pulse animate-spin">
  テキスト
</div>
```

## 🔧 カスタマイズ

### テーマ拡張

```typescript
// custom-theme.ts
import { theme } from '@/config/theme'

export const customTheme = {
  ...theme,
  // カスタムスタイルを追加
  custom: {
    specialButton: `
      ${transition.fast} 
      ${hover.glow} 
      ${elevation.subtle}
      bg-gradient-to-r from-purple-500 to-pink-500
    `
  }
}
```

### 新しいアニメーションパターンの追加

```typescript
// カスタムアニメーション追加例
export const customAnimations = {
  // 特別なローディング
  specialLoading: 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300',
  
  // カスタムホバー効果
  floatingHover: `
    ${transition.normal}
    hover:shadow-lg hover:-translate-y-1
    transform-gpu
  `,
  
  // ページ遷移
  pageTransition: `
    ${appear.fadeIn}
    ${transition.slow}
  `
}
```

## 🐛 トラブルシューティング

### よくある問題

1. **スタイルが適用されない**
   ```typescript
   // 正しいインポートパスか確認
   import { heading } from '@/config/theme'
   ```

2. **TypeScriptエラー**
   ```typescript
   // 型定義をインポート
   import type { TypographyVariant } from '@/config/theme'
   ```

3. **ダークモードで見えない**
   ```typescript
   // ダークモード対応クラスを使用
   className={colors.neutral.text.primary} // ✅
   className="text-black" // ❌
   ```

4. **アニメーションが動かない**
   ```typescript
   // Tailwindの設定でアニメーションが有効か確認
   // purge設定で必要なクラスが除外されていないか確認
   ```

### デバッグ支援

```typescript
// 開発時のデバッグ用
import { showDesignSystemOverview } from '@/config/theme'

// 利用可能なオプションを表示
showDesignSystemOverview()
```

## 📈 今後の拡張予定

- [ ] モーションシステムの充実
- [ ] カスタムテーマビルダー
- [ ] スタイルガイドページ
- [ ] デザインパターンライブラリ
- [ ] アクセシビリティチェッカー
- [ ] パフォーマンス最適化ツール

## 🤝 コントリビューション

デザインシステムの改善提案は以下の手順で行ってください：

1. **問題の特定**: 現在のシステムで解決できない課題
2. **解決案の提示**: 具体的な実装方法
3. **影響範囲の評価**: 既存コードへの影響
4. **実装とテスト**: 実際の使用場面での検証

---

**📖 このドキュメントについて**: BoxLog デザインシステム包括ガイド  
**最終更新**: 2025-08-21  
**バージョン**: v3.0 - 統合・一元化版  
**管理**: BoxLog開発チーム