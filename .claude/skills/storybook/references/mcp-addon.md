# MCP Server 連携（`@storybook/addon-mcp`）

Storybook公式のMCPアドオンにより、Storybook起動中はClaude CodeからMCPツールが利用可能。

## セットアップ

- **アドオン**: `@storybook/addon-mcp@0.3.2`（`.storybook/main.ts` に設定済み）
- **MCPサーバー**: `http://localhost:6006/mcp`（`.mcp.json` に登録済み）
- **前提条件**: Storybookが起動中であること（`npm run storybook`）

## 利用可能なMCPツール

| ツール                         | 機能                                    | ツールセット   |
| ------------------------------ | --------------------------------------- | -------------- |
| `get_ui_building_instructions` | プロジェクトのUI開発ガイドラインを取得  | dev            |
| `preview-stories`              | ストーリーのURLを取得（ブラウザ確認用） | dev            |
| `list-all-documentation`       | コンポーネント一覧を取得                | docs（実験的） |
| `get-documentation`            | 特定コンポーネントのドキュメントを取得  | docs（実験的） |

## 設定内容

```ts
// .storybook/main.ts
{
  name: '@storybook/addon-mcp',
  options: {
    toolsets: {
      dev: true,   // Story URL取得・UI開発ガイドライン
      docs: true,  // コンポーネントドキュメント（実験的）
    },
  },
},
// docsツールセットに必要
features: {
  experimentalComponentsManifest: true,
},
```

## 使い分け

| 状況            | 使うもの                                            |
| --------------- | --------------------------------------------------- |
| Storybook起動中 | MCPツール（リアルタイムでコンポーネント情報を取得） |
| Storybook停止中 | このスキル（SKILL.md）のルールに従ってStory作成     |

## 注意事項

- MCPサーバーはStorybook起動中のみ接続可能
- Storybook停止中にMCPツールを呼ぶとエラーになるが、開発に支障はない
- MCPツールの出力とこのスキルのルールが矛盾する場合、**このスキルのルールを優先**する
