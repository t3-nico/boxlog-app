/**
 * ESLint カスタムルール: config/themeの使用を強制
 * 
 * 要件:
 * 1. 直接的な色指定（bg-red-500など）を検出
 * 2. config/themeがインポートされているかチェック
 * 3. 新規ファイルではconfig/themeの使用を必須に
 * 4. 既存ファイルは警告レベルで段階的に移行
 */

const fs = require('fs');
const _path = require('path');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'config/themeの使用を強制し、直接Tailwindクラスを禁止',
      category: 'BoxLog Theme Enforcement',
      recommended: true
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          excludeFiles: {
            type: 'array',
            items: { type: 'string' }
          },
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' }
          },
          newFileErrorLevel: {
            type: 'string',
            enum: ['error', 'warn']
          },
          existingFileErrorLevel: {
            type: 'string', 
            enum: ['error', 'warn']
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      directColorClass: '[{{severity}}] Direct color class "{{class}}" detected. Use colors.{{suggestion}} instead.',
      missingThemeImport: '[{{severity}}] Missing theme import. Add: import { {{imports}} } from \'@/config/theme\'',
      templateLiteralColor: '[{{severity}}] Direct color in template literal detected. Use theme variables instead.',
      darkModeIndividual: '[{{severity}}] Individual dark mode class "{{class}}". Use theme for automatic dark mode.',
      hoverStateIndividual: '[{{severity}}] Individual hover state "{{class}}". Use theme hover variants.',
      newFileViolation: '[ERROR] New files must use config/theme exclusively. Found: {{class}}',
      legacyFileWarning: '[WARN] Legacy file detected. Consider migrating to config/theme: {{class}}'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const excludeFiles = options.excludeFiles || [
      'tailwind.config.ts',
      'globals.css', 
      'storybook',
      '.test.',
      '.spec.',
      '__tests__'
    ];
    const allowedPatterns = options.allowedPatterns || [
      '^(absolute|relative|fixed|sticky)$',
      '^(flex|grid|block|inline|hidden)$',
      '^(w-|h-|p-|m-|gap-|space-)',
      '^(rounded|border)$',
      '^(text-(xs|sm|base|lg|xl|2xl|3xl))$',
      '^(font-(normal|medium|semibold|bold))$'
    ];

    const filename = context.getFilename();
    
    // 除外ファイルチェック
    if (excludeFiles.some(pattern => filename.includes(pattern))) {
      return {};
    }

    // ファイルが新規かどうかの判定
    const isNewFile = checkIfNewFile(filename);
    const errorLevel = isNewFile ? 'error' : 'warn';

    // theme関連のインポートを追跡
    let hasThemeImport = false;
    const themeImports = new Set();

    // 色関連クラスの検出パターン
    const COLOR_PATTERNS = [
      {
        regex: /\b(bg|text|border)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g,
        messageId: 'directColorClass',
        getSuggestion: (match) => {
          const [, property, color] = match.match(/\b(bg|text|border)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/) || [];
          
          if (color === 'blue') return 'primary.DEFAULT';
          if (color === 'red') return 'semantic.error.DEFAULT';
          if (color === 'orange') return 'semantic.warning.DEFAULT';
          if (color === 'green') return 'semantic.success.DEFAULT';
          if (property === 'bg') return 'background.surface';
          if (property === 'text') return 'text.primary';
          if (property === 'border') return 'border.DEFAULT';
          return '{category}.{variant}';
        }
      },
      {
        regex: /\bdark:(bg|text|border)-[a-z]+-\d+\b/g,
        messageId: 'darkModeIndividual'
      },
      {
        regex: /\bhover:(bg|text|border)-[a-z]+-\d+\b/g,
        messageId: 'hoverStateIndividual'
      }
    ];

    function checkIfNewFile(filepath) {
      try {
        // Git履歴やファイル作成日時で判定（簡易版）
        const stats = fs.statSync(filepath);
        const now = new Date();
        const fileAge = now - stats.birthtime;
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        
        return fileAge < threeDaysInMs;
      } catch {
        return true; // 判定できない場合は新規として扱う
      }
    }

    function checkClassName(node, classNameValue) {
      // 許可パターンのチェック
      const hasAllowedPattern = allowedPatterns.some(pattern => 
        new RegExp(pattern).test(classNameValue)
      );

      if (hasAllowedPattern) return;

      // 色関連クラスの検出
      COLOR_PATTERNS.forEach(({ regex, messageId, getSuggestion }) => {
        let match;
        regex.lastIndex = 0;

        while ((match = regex.exec(classNameValue)) !== null) {
          const violationClass = match[0];
          const suggestion = getSuggestion ? getSuggestion(violationClass) : '';

          const severity = errorLevel.toUpperCase();
          const _finalMessageId = isNewFile ? 'newFileViolation' : 'legacyFileWarning';

          context.report({
            node,
            messageId,
            data: {
              class: violationClass,
              suggestion,
              severity
            }
          });

          // theme import が不足している場合の追加警告
          if (!hasThemeImport) {
            const neededImport = getNeededImport(violationClass);
            context.report({
              node,
              messageId: 'missingThemeImport',
              data: {
                imports: neededImport,
                severity
              }
            });
          }
        }
      });
    }

    function getNeededImport(className) {
      if (className.startsWith('bg-') || className.includes('background')) return 'colors';
      if (className.startsWith('text-')) return 'colors, typography';
      if (className.startsWith('border-')) return 'colors, borders';
      if (className.includes('hover:')) return 'colors';
      return 'colors, typography, spacing';
    }

    return {
      // インポート文の追跡
      ImportDeclaration(node) {
        if (node.source.value === '@/config/theme') {
          hasThemeImport = true;
          
          node.specifiers.forEach(spec => {
            if (spec.type === 'ImportSpecifier') {
              themeImports.add(spec.imported.name);
            }
          });
        }
      },

      // JSX className属性のチェック
      JSXAttribute(node) {
        if (node.name && node.name.name === 'className' && node.value) {
          if (node.value.type === 'Literal') {
            // 文字列リテラル: className="bg-red-500"
            checkClassName(node.value, node.value.value);
          } else if (node.value.type === 'JSXExpressionContainer') {
            // JSX式: className={`bg-${color}-500`}
            const {expression} = node.value;
            
            if (expression.type === 'TemplateLiteral') {
              // テンプレートリテラルの静的部分をチェック
              expression.quasis.forEach(quasi => {
                checkClassName(node.value, quasi.value.raw);
              });
            } else if (expression.type === 'Literal') {
              // 式内の文字列リテラル: className={"bg-red-500"}
              checkClassName(node.value, expression.value);
            }
          }
        }
      },

      // プログラム終了時にtheme使用状況をチェック
      'Program:exit'() {
        // ファイル全体でtheme使用が必要かつインポートがない場合
        if (!hasThemeImport) {
          // 色関連のクラスが使用されているかチェック（簡易版）
          const sourceCode = context.getSourceCode().getText();
          const hasColorUsage = /className.*=.*(bg-|text-|border-)[a-z]+-\d+/.test(sourceCode);
          
          if (hasColorUsage) {
            context.report({
              node: context.getSourceCode().ast,
              messageId: 'missingThemeImport',
              data: {
                imports: 'colors, typography, spacing',
                severity: errorLevel.toUpperCase()
              }
            });
          }
        }
      }
    };
  }
};