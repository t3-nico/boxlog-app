/**
 * ESLint カスタムルール: 直接Tailwindクラスの使用を防止
 * 
 * BoxLog Theme System との統合を強制します
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'theme経由でないTailwindクラスの使用を禁止',
      category: 'BoxLog Theme Enforcement',
      recommended: true
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' }
          },
          excludeFiles: {
            type: 'array', 
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      directTailwind: 'Direct Tailwind class "{{class}}" detected. Use theme instead: colors.{{suggestion}}',
      darkModeIndividual: 'Individual dark mode class "{{class}}" detected. Use theme for automatic dark mode support.',
      hoverDirect: 'Direct hover class "{{class}}" detected. Use theme hover variants instead.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedPatterns = options.allowedPatterns || [];
    const excludeFiles = options.excludeFiles || [];
    
    // ファイルパスチェック
    const filename = context.getFilename();
    if (excludeFiles.some(pattern => filename.includes(pattern))) {
      return {};
    }

    // 検出パターン
    const VIOLATION_PATTERNS = [
      {
        regex: /\b(bg|text|border)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g,
        type: 'directTailwind',
        getSuggestion: (match) => {
          const [, property, color] = match.match(/\b(bg|text|border)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/);
          if (color === 'blue') return `primary.DEFAULT`;
          if (color === 'red') return `semantic.error.DEFAULT`;
          if (color === 'orange') return `semantic.warning.DEFAULT`;
          if (color === 'green') return `semantic.success.DEFAULT`;
          if (property === 'bg') return `background.surface`;
          if (property === 'text') return `text.primary`;
          if (property === 'border') return `border.DEFAULT`;
          return `{category}.{variant}`;
        }
      },
      {
        regex: /\bdark:(bg|text|border)-[a-z]+-\d+\b/g,
        type: 'darkModeIndividual'
      },
      {
        regex: /\bhover:(bg|text|border)-[a-z]+-\d+\b/g,
        type: 'hoverDirect'
      }
    ];

    return {
      JSXAttribute(node) {
        if (node.name && node.name.name === 'className' && node.value) {
          let classNameValue = '';
          
          // className の値を取得
          if (node.value.type === 'Literal') {
            classNameValue = node.value.value;
          } else if (node.value.type === 'JSXExpressionContainer') {
            // テンプレートリテラルや文字列結合は簡単にはチェックできないのでスキップ
            return;
          }

          // 許可パターンをチェック
          const isAllowed = allowedPatterns.some(pattern => 
            new RegExp(pattern).test(classNameValue)
          );
          if (isAllowed) return;

          // 違反を検出
          VIOLATION_PATTERNS.forEach(({ regex, type, getSuggestion }) => {
            let match;
            regex.lastIndex = 0; // グローバル正規表現のリセット
            
            while ((match = regex.exec(classNameValue)) !== null) {
              const violationClass = match[0];
              const suggestion = getSuggestion ? getSuggestion(violationClass) : '';

              context.report({
                node: node.value,
                messageId: type,
                data: {
                  class: violationClass,
                  suggestion
                }
              });
            }
          });
        }
      }
    };
  }
};