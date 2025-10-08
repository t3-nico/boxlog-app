# Rich Text Editor Components

BoxLogアプリケーション用のリッチテキストエディタコンポーネント群です。

## 概要

EventDetailInspectorContentのメモ機能向けに、Tiptapベースの安定したリッチテキストエディタを実装しました。

## 実装の背景

### 問題

- 元のTextareaでは基本的なテキスト入力のみ
- ContentEditableベースのカスタム実装では無限ループが発生
- 幅制約の問題でInspector panel内での表示が崩れる

### 解決策

Tiptapライブラリを採用し、以下の要件を満たすエディタを実装：

- 安定した状態管理
- Inspector panelの幅制約に適合
- 基本的なリッチテキスト機能

## コンポーネント構成

### TiptapEditor

- **ファイル**: `tiptap-editor.tsx`
- **用途**: メイン実装、Tiptapベースの安定したエディタ
- **状態管理**: 無限ループなし、SSR対応済み

### SimpleRichEditor (廃止予定)

- **ファイル**: `simple-rich-editor.tsx`
- **状態**: 無限ループ問題により使用停止
- **理由**: ContentEditableの状態管理の複雑さ

## 機能

### 基本機能

- **太字** (`Ctrl/Cmd + B`)
- **斜体** (`Ctrl/Cmd + I`)
- **下線** (`Ctrl/Cmd + U`)

### リスト機能

- **箇条書き** (`Ctrl/Cmd + Shift + 8`)
- **番号付きリスト** (`Ctrl/Cmd + Shift + 7`)
- **チェックリスト** (ツールバーから)

### その他

- **改行処理**: Enterキーで自然な改行
- **幅制約**: Inspector panel内で適切に制約
- **プレースホルダー**: 空の状態での表示

## 技術詳細

### 依存関係

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-task-list": "^2.x",
  "@tiptap/extension-task-item": "^2.x"
}
```

### SSR対応

```tsx
const editor = useEditor({
  // ...
  immediatelyRender: false, // SSRハイドレーション問題を解決
})
```

### スタイリング

- **Tailwind CSS**: 基本スタイリング
- **専用CSS**: `tiptap-styles.css` でリスト表示を制御
- **スコープ化**: `.tiptap-editor-content` でグローバルCSSとの競合回避

## 使用方法

```tsx
import { TiptapEditor } from '@/components/ui/rich-text-editor/tiptap-editor'
;<TiptapEditor
  value={description}
  onChange={(html) => setDescription(html)}
  placeholder="メモを入力..."
  className="min-h-[120px]"
/>
```

## トラブルシューティング

### リストが横並びになる問題

- **原因**: proseクラスとTailwindリセットの競合
- **解決**: 専用CSSファイルでブラウザネイティブのリスト表示を使用

### 無限ループ問題

- **原因**: ContentEditableの状態管理循環
- **解決**: Tiptapの内部状態管理を使用

### SSRエラー

- **原因**: ハイドレーション時の不整合
- **解決**: `immediatelyRender: false` を設定

## 今後の拡張

- 画像挿入機能
- テーブル機能
- カラー設定
- フォントサイズ調整

## 関連ファイル

- `src/features/events/components/inspector/EventDetailInspectorContent.tsx` - 使用側
- `src/components/ui/rich-text-editor/tiptap-styles.css` - 専用スタイル
- `src/config/theme/` - テーマシステム連携
