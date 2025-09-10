# Changelog

All notable changes to BoxLog App will be documented in this file.

## [Unreleased]

### Added
- **Rich Text Editor for Event Memos**: Tiptapベースのリッチテキストエディタをイベント詳細のメモ欄に実装
  - 太字、斜体、下線のテキスト装飾機能
  - 箇条書き、番号付きリスト、チェックリスト機能
  - Inspector panel内での適切な幅制約対応
  - SSR対応とハイドレーション問題の解決

### Changed
- **EventDetailInspectorContent**: メモ入力欄をTextareaからTiptapEditorに変更
- **Inspector Layout**: 幅オーバーフロー問題を修正（`overflow-hidden` → `overflow-auto`）

### Technical Details
- 新規依存関係: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`
- 専用CSSファイル追加: `src/components/ui/rich-text-editor/tiptap-styles.css`
- リッチテキストエディタコンポーネント群: `src/components/ui/rich-text-editor/`

### Fixed
- EventDetailInspectorContentの幅オーバーフロー問題
- ContentEditableベースエディタの無限ループ問題  
- リスト項目が横並びになる表示問題
- SSRハイドレーション不整合エラー

### Development Notes
- SimpleRichEditorは無限ループ問題により廃止
- TiptapEditorが推奨実装として採用
- inspector-content.tsxで`overflow-auto`設定が重要な修正点