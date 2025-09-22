/**
 * ESLint Accessibility Configuration
 *
 * WCAG AA準拠のアクセシビリティルール設定
 * jsx-a11yプラグインとaxe-coreの統合
 */

module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    // === Core Accessibility Rules ===

    // ARIA属性の適切な使用
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/aria-role': ['error', { ignoreNonDOM: false }],

    // 有効なARIA属性値
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/autocomplete-valid': 'error',

    // === Form Accessibility ===

    // ラベルとフォームコントロールの関連付け
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['Label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['Input', 'Textarea', 'Select'],
        assert: 'either',
        depth: 3,
      },
    ],

    // フォームフィールドの要件
    'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],

    // === Interactive Elements ===

    // インタラクティブ要素の役割
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': [
      'error',
      {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
      },
    ],
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'error',
      {
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
      },
    ],

    // === Keyboard Navigation ===

    // キーボードアクセシビリティ
    'jsx-a11y/no-noninteractive-tabindex': [
      'error',
      {
        tags: [],
        roles: ['tabpanel'],
      },
    ],
    'jsx-a11y/tabindex-no-positive': 'error',

    // === Click/Touch Targets ===

    // クリック可能要素
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': [
      'error',
      {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
      },
    ],

    // === Media ===

    // メディア要素
    'jsx-a11y/media-has-caption': 'error',

    // === Images ===

    // 画像のalt属性
    'jsx-a11y/alt-text': [
      'error',
      {
        elements: ['img', 'object', 'area', 'input[type="image"]'],
        img: ['Image'],
        object: ['Object'],
        area: ['Area'],
        'input[type="image"]': ['InputImage'],
      },
    ],
    'jsx-a11y/img-redundant-alt': 'error',

    // === Headings and Structure ===

    // 見出し構造
    'jsx-a11y/heading-has-content': ['error', { components: ['Heading', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'] }],

    // === Links ===

    // リンクのアクセシビリティ
    'jsx-a11y/anchor-has-content': ['error', { components: ['Link', 'Anchor'] }],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],

    // === Language ===

    // 言語属性
    'jsx-a11y/lang': 'error',

    // === Distracting Content ===

    // 気を散らすコンテンツ
    'jsx-a11y/no-distracting-elements': 'error',

    // === Scope ===

    // スコープ属性
    'jsx-a11y/scope': 'error',

    // === Custom Rules for BoxLog ===

    // カスタム設定: BoxLogアプリ固有の要件
  },

  // 特定ファイルでの例外設定
  overrides: [
    {
      // テストファイルでは一部ルールを緩和
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*'],
      rules: {
        'jsx-a11y/no-autofocus': 'off', // テスト環境では自動フォーカスを許可
        'jsx-a11y/no-noninteractive-element-interactions': 'off', // テスト用のモック要素
      },
    },
    {
      // Storybookファイルでは例外を許可
      files: ['**/*.stories.{ts,tsx}'],
      rules: {
        'jsx-a11y/no-autofocus': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
      },
    },
    {
      // 外部ライブラリコンポーネントラッパー
      files: ['src/components/shadcn-ui/**/*.tsx', 'src/components/kibo-ui/**/*.tsx'],
      rules: {
        'jsx-a11y/no-static-element-interactions': 'warn', // 外部ライブラリは警告レベル
      },
    },
    {
      // Legacy components（段階的移行中）
      files: ['src/components/legacy/**/*.tsx'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      },
    },
  ],

  // 環境設定
  env: {
    browser: true,
  },

  // 設定情報
  settings: {
    'jsx-a11y': {
      polymorphicPropName: 'as',
      components: {
        // shadcn/ui コンポーネントマッピング
        Button: 'button',
        Input: 'input',
        Textarea: 'textarea',
        Select: 'select',
        Label: 'label',
        Link: 'a',
        Heading: 'h1',

        // kiboUI コンポーネントマッピング
        Panel: 'div',
        Card: 'div',
        Modal: 'dialog',

        // カスタムコンポーネントマッピング
        IconButton: 'button',
        NavLink: 'a',
        FormField: 'div',
      },
    },
  },
}