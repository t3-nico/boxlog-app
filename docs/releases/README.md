# リリース管理

このディレクトリには、BoxLogの各バージョンのリリースノートとバージョニング管理に関するドキュメントが含まれています。

## 📁 ファイル構成

```
docs/releases/
├── README.md              # このファイル
├── VERSIONING.md          # バージョニング管理ガイド
├── template.md            # リリースノートテンプレート
└── v0.0.1.md             # 各バージョンのリリースノート
```

## 📋 リリースノート一覧

| バージョン | リリース日 | 概要 |
|-----------|-----------|------|
| [v0.0.1](v0.0.1.md) | 2025-10-01 | 初回リリース - 基本機能実装 |

## 🚀 新しいリリースを作成する手順

### 1. リリースノート作成
```bash
# テンプレートをコピー
cp docs/releases/template.md docs/releases/vX.Y.Z.md

# 内容を編集
# - バージョン番号を更新
# - リリース日を記入
# - 変更内容を記載
```

### 2. CHANGELOG.md 更新
```bash
# [Unreleased] セクションの内容を新バージョンに移動
# リリース日とバージョンリンクを追加
```

### 3. バージョンアップ
```bash
# PATCH (バグ修正)
npm version patch -m "chore: bump version to %s"

# MINOR (新機能)
npm version minor -m "feat: bump version to %s"

# MAJOR (破壊的変更)
npm version major -m "feat!: bump version to %s"
```

### 4. プッシュ & GitHub Release
```bash
# タグとコミットをプッシュ
git push origin dev
git push origin vX.Y.Z

# GitHub Releaseを作成
gh release create vX.Y.Z \
  --title "Release vX.Y.Z" \
  --notes-file .github/RELEASE_TEMPLATE.md
```

## 📖 関連ドキュメント

- [VERSIONING.md](VERSIONING.md) - 詳細なバージョニングガイド
- [CHANGELOG.md](../../CHANGELOG.md) - 全バージョンの変更履歴
- [.github/RELEASE_TEMPLATE.md](../../.github/RELEASE_TEMPLATE.md) - GitHub Releaseテンプレート

## 🔗 外部リンク

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://github.com/t3-nico/boxlog-app/releases)

## 📝 バージョニングルール

BoxLogは **Semantic Versioning 2.0.0** に準拠しています。

### バージョン形式: `X.Y.Z`

- **MAJOR (X)**: 破壊的変更
- **MINOR (Y)**: 新機能追加（後方互換性あり）
- **PATCH (Z)**: バグ修正（後方互換性あり）

詳細は [VERSIONING.md](VERSIONING.md) を参照してください。
