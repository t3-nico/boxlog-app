# 依存関係の運用

## 新規追加の判断基準

パッケージを追加する前に確認する:

1. ブラウザ標準API or 言語標準で実現できないか？
2. 既存の依存で代替できないか？
3. GitHub Stars >= 1000、最終コミット6ヶ月以内か？

### 標準APIで十分な例

```typescript
// ✅ ライブラリ不要
const id = crypto.randomUUID(); // UUID生成
const copy = structuredClone(obj); // ディープコピー
const formatted = new Intl.DateTimeFormat('ja').format(date); // 日付
const response = await fetch(url); // HTTP
```

## バージョン管理

- `^`（キャレット）で指定、lockファイルは必ずコミット
- セキュリティアップデート → 即対応
- パッチ・マイナー → 月1でまとめて
- メジャー → 必要に迫られるまで放置でOK

## 避けるべきパターン

- 1つの機能のためだけに大きなライブラリを追加する
- 同じ用途のライブラリを複数入れる（moment + dayjs + date-fns）
- ラッパーライブラリを本体の代わりに使う

## 定期チェック（月1推奨）

```bash
npm ls --all | grep -E "UNMET|invalid"  # 依存整合性
npm audit                                # セキュリティ
```
