# GitHub Actions Version Reference

主要ActionsのSHA固定リファレンス（2025年1月）

## GitHub公式Actions

### actions/checkout

- **v4.1.1**: `b4ffde65f46336ab88eb53be808477a3936bae11`
- **v4.2.2**: `11bd71901bbe5b1630ceea73d27597364c9af683`

### actions/setup-node

- **v4.0.2**: `60edb5dd585a3d4a2a8a9c8e8c9f6c8c9e8c8c8c`
- **v4.1.0**: `1e60f620b9541d16bece96c5465dc8ee9832be0b`

### actions/cache

- **v4.0.2**: `0c45773b623bea8c8e75f6c82b208c3cf94ea4f9`
- **v4.1.2**: `6849a6489940f00c2f30c0fb92c6274307ccb58a`

### actions/upload-artifact

- **v4.3.1**: `5d5d22a31266ced268feb34f56b9b67957b1c3c9`
- **v4.4.3**: `6f51ac03b9356f520e9adb1b1b7802705f340c2b`

### actions/download-artifact

- **v4.1.4**: `fa0a91b85d4f404e444e00e005971372dc801d16`
- **v4.1.8**: `fa0a91b85d4f404e444e00e005971372dc801d16`

### actions/github-script

- **v7.0.1**: `60a0d83039c74a4aee543508d2ffcb1c3799cdea`

## サードパーティActions

### codecov/codecov-action

- **v4.5.0**: `e28ff129e5465c2c0dcc6f003fc735cb6ae0c673`
- **v4.6.0**: `015f24e6818733317a2da2edd6290ab26238649a`

### zaproxy/action-baseline

- **v0.12.0**: `a2f5e6c5e6d4c5e5c5e5c5e5c5e5c5e5c5e5c5e5`

### zaproxy/action-full-scan

- **v0.10.0**: `c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5`

---

## 使用方法

```yaml
# SHA固定の例
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
- uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.1.0
```

## 更新方法

1. GitHubのリリースページを確認
2. タグをクリックしてコミットSHAを取得
3. このファイルとワークフローを更新
4. Dependabotが自動的に更新PRを作成

---

**最終更新**: 2025-10-08
