# Release v0.11.0

**リリース日**: 2025-12-26
**バージョン**: 0.11.0

## 概要

セキュリティ・保守性・パフォーマンスの3つの柱を大幅に強化した大型リリース。セキュリティスコア92点達成、未使用コード134ファイル削除、PPR（Partial Prerendering）有効化、モバイルカレンダーUX改善を含む。

---

## 変更内容

### ✨ 新機能 (Added)

#### 認証・セキュリティ ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

**MFAリカバリーコード**

- リカバリーコードの表示・コピー機能
- コード紛失時の再生成フロー

**APIキー暗号化保存**

- Web Crypto API (AES-256-GCM) による暗号化
- PBKDF2鍵導出（100,000イテレーション）
- ユーザーIDベースの暗号化キー

**監査ログGeoIP統合**

- ログインイベントに地理情報を記録
- 不審なアクセス検知の基盤

#### テスト・品質 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

- **認証テスト刷新**: Supabaseモックベースの23テスト、useAuth hookの完全カバレッジ
- **カオスエンジニアリングテスト**: 障害注入テストの基盤、システム耐障害性の検証

#### モバイルカレンダーUX改善 ([#837](https://github.com/t3-nico/boxlog-app/pull/837))

- Googleカレンダー風プランカード（左ボーダー + チェックボックス + タイトル）
- タッチ操作・ハプティックフィードバック対応
- toast位置をM3準拠に変更
- チェックボックスタップで完了切り替え

### 🔄 変更 (Changed)

#### モバイルタッチ操作のGAFA標準準拠 ([#835](https://github.com/t3-nico/boxlog-app/pull/835))

- 長押し検出（300ms）でドラッグモード開始
- ダブルタップ → 長押し+離すに変更（ズーム競合解消）
- スワイプ閾値を画面幅の12%に相対値化
- モバイルでスクロールバー非表示

#### 依存関係整理 ([#835](https://github.com/t3-nico/boxlog-app/pull/835), [#836](https://github.com/t3-nico/boxlog-app/pull/836))

**削除した依存関係**

- Lexical関連12パッケージ（Novelのみ使用）
- react-dnd系（dnd-kitのみ使用）
- nanoid → `crypto.randomUUID()`
- immer → 直接importなし
- jotai → useState（CLAUDE.md準拠）
- fuse.js → cmdk内蔵検索に移行
- use-debounce → 自前の`useDebouncedCallback`フック

#### ドキュメント追加 ([#835](https://github.com/t3-nico/boxlog-app/pull/835), [#836](https://github.com/t3-nico/boxlog-app/pull/836), [#838](https://github.com/t3-nico/boxlog-app/pull/838))

| ドキュメント             | 内容                                |
| ------------------------ | ----------------------------------- |
| セキュリティ現状レポート | セキュリティ監査結果・スコア92点    |
| 信頼性現状レポート       | SLO/SLI定義・可用性目標             |
| 保守性ステータスレポート | コード品質指標・技術的負債          |
| コード品質レポート       | 型安全性・ESLint準拠状況            |
| アクセシビリティ調査     | axe-core導入・WCAG準拠状況          |
| Next.js最適化ガイド      | App Router最適化パターン            |
| 運用ドキュメント3点      | 運用手順・監視設定                  |
| GAFA-First原則           | 依存関係運用ルールをCLAUDE.mdに追加 |

### ⚡ パフォーマンス (Performance)

#### Core Web Vitals最適化 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

**PPR (Partial Prerendering) 有効化**

- Server-side prefetch実装
- 初回ロード時間の大幅短縮

**LCP最適化**

- クリティカルCSS最適化
- Service Worker自動バージョニング
- バンドルサイズ最適化

**ページ遷移パフォーマンス改善**

- ルーティング最適化
- プリフェッチ戦略の改善

#### レンダリング最適化 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

- GlobalSearchProviderの`contextValue`をメモ化し再レンダリング防止

### 🔒 セキュリティ (Security)

#### 包括的セキュリティ強化 ([#835](https://github.com/t3-nico/boxlog-app/pull/835), [#838](https://github.com/t3-nico/boxlog-app/pull/838))

- CSP (Content Security Policy) を環境別に設定
- セキュリティヘッダー最適化
- 入力検証の強化
- MFAバイパス脆弱性を修正
- タッチターゲット44x44px（Apple HIG準拠）

### 🐛 バグ修正 (Fixed)

- **tRPC server helpers**: PPR設定との互換性修正 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))
- **タイムゾーン非依存テスト**: CI/CDでの安定性向上 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))
- **e2e-weekly.yml**: YAMLパースエラー修正 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))
- **モバイルログインフリーズ**: フッター/ヘッダーのClient Component分離 ([#836](https://github.com/t3-nico/boxlog-app/pull/836))
- **カレンダーサイドバー**: ビュー切り替えUI修正 ([#837](https://github.com/t3-nico/boxlog-app/pull/837))
- **hooks エラー**: "Rendered more hooks than during the previous render" 修正 ([#837](https://github.com/t3-nico/boxlog-app/pull/837))
- **Next.js 15互換性**: API route paramsをPromise<T>型に修正 ([#835](https://github.com/t3-nico/boxlog-app/pull/835))
- **ResizeHandle**: メモリリーク修正 ([#835](https://github.com/t3-nico/boxlog-app/pull/835))
- **SW**: 開発環境でService Worker登録をスキップ ([#835](https://github.com/t3-nico/boxlog-app/pull/835))

### 🗑️ コード品質・保守性 (Maintenance)

#### 未使用コード削除（計134ファイル）([#838](https://github.com/t3-nico/boxlog-app/pull/838))

- calendar feature内: 58ファイル削除
- コンポーネント・hooks・config: 61ファイル削除
- index.tsファイル: 15ファイル削除
- knip検出: 248→0

#### 大規模コンポーネント分割 ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

- CalendarDragSelection.tsx: 707行 → 4ファイル
- TagsSidebar.tsx: 651行 → 3ファイル
- TagInspector.tsx: 622行 → 4ファイル
- PlanInspectorContent.tsx: 611行 → 4ファイル

#### 命名規則・コード統一 ([#835](https://github.com/t3-nico/boxlog-app/pull/835), [#838](https://github.com/t3-nico/boxlog-app/pull/838))

- hooks命名を`use〇〇`形式に統一
- SignupFormをreact-hook-form + Zodに移行
- useFocusTrapをRadix UI Dialogに置換
- Prettier設定をデフォルト寄りに最適化

### 🔧 CI/CD・インフラ ([#838](https://github.com/t3-nico/boxlog-app/pull/838))

- 月次運用リマインダー自動化
- e2e-weekly.ymlのsecrets→vars変更
- husky.shの非推奨行を削除

---

## 破壊的変更 (Breaking Changes)

### 削除された依存関係

- Lexical関連12パッケージ
- react-dnd系パッケージ
- nanoid, immer, jotai, fuse.js, use-debounce

### API変更

- Next.js 15対応: API route paramsがPromise<T>型に変更

---

## 統計

| 項目         | 数値   |
| ------------ | ------ |
| コミット数   | 53     |
| 新規ファイル | 15+    |
| 削除ファイル | 134    |
| 削除行数     | 5,000+ |

---

## 関連リンク

### Pull Requests

| PR                                                     | タイトル                                                               | コミット数 |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | ---------- |
| [#838](https://github.com/t3-nico/boxlog-app/pull/838) | chore(release): v0.11.0 セキュリティ・保守性・パフォーマンス強化       | 34         |
| [#837](https://github.com/t3-nico/boxlog-app/pull/837) | feat(mobile): モバイルカレンダーUX改善                                 | 7          |
| [#836](https://github.com/t3-nico/boxlog-app/pull/836) | fix: モバイルログインフリーズ修正 & GAFA-First原則に基づく依存関係削減 | 5          |
| [#835](https://github.com/t3-nico/boxlog-app/pull/835) | chore: 依存関係整理・Next.js 15互換性・モバイルUX改善                  | 20         |

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v0.10.0...v0.11.0
