# Public Assets Directory

このディレクトリはNext.jsの静的ファイル配信用です。

## 📂 ディレクトリ構造

```
/public/
├── favicon.ico          # サイトアイコン
├── manifest.json        # PWA設定
├── robots.txt          # SEO設定
├── images/             # 画像ファイル
│   ├── logo/          # ロゴ関連
│   ├── ui/            # UI要素画像
│   └── backgrounds/   # 背景画像
└── icons/             # アイコンファイル
    ├── feature-icons/ # 機能アイコン
    └── status-icons/  # ステータスアイコン
```

## 🔗 アクセス方法

ファイルは`/`からの相対パスでアクセス可能：

- `public/favicon.ico` → `http://localhost:3001/favicon.ico`
- `public/images/logo.png` → `http://localhost:3001/images/logo.png`

## 📋 ファイル配置ルール

### DO ✓

- 画像、アイコン、フォントなどの静的ファイル
- robots.txt、sitemap.xml、manifest.jsonなどのメタファイル
- 直接URLでアクセスしたいファイル

### DON'T ✗

- コンポーネントやTypeScriptファイル
- 設定ファイル（Next.js管理外）
- 機密情報を含むファイル

## 🎯 命名規則

- **小文字**: ファイル名は小文字を推奨
- **ハイフン区切り**: `my-icon.svg`
- **説明的**: 用途が分かる名前を使用
