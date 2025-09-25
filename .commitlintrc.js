module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 型の設定
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新機能
        'fix', // バグ修正
        'docs', // ドキュメントのみ
        'style', // コードの意味に影響しない変更（空白、フォーマット等）
        'refactor', // バグ修正でも機能追加でもないコード変更
        'perf', // パフォーマンス改善
        'test', // テスト追加・修正
        'chore', // ビルドプロセスやツールの変更
        'ci', // CI設定ファイル・スクリプト変更
        'build', // ビルドシステム・外部依存の変更
        'revert', // コミットの取り消し
      ],
    ],
    // コミットメッセージの最大長設定
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
    // 日本語対応
    'subject-case': [0], // 大文字小文字の制限を無効化
    'subject-empty': [2, 'never'], // subject必須
    'type-case': [2, 'always', 'lower-case'], // typeは小文字のみ
    'type-empty': [2, 'never'], // type必須
  },
  // カスタム設定：日本語対応
  ignores: [
    // マージコミットを無視
    (message) => message.includes('Merge'),
    // リリースタグを無視
    (message) => message.match(/^v\d+\.\d+\.\d+/),
  ],
}
