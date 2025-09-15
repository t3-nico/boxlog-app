/**
 * BoxLog Bundle Optimization ESLint Rules
 * 
 * バンドルサイズとパフォーマンス最適化のためのカスタムルール
 */

module.exports = {
  'no-heavy-library-imports': {
    meta: {
      type: 'suggestion',
      docs: {
        description: '重いライブラリの不適切なインポートを防止',
        category: 'Bundle Size',
        recommended: true
      },
      fixable: 'code',
      schema: [],
      messages: {
        heavyLibraryImport: '{{library}}は重いライブラリです。必要な部分のみインポートしてください。',
        entireLibraryImport: '{{library}}の全体インポートは避けてください。必要な関数のみインポートしてください。',
        defaultImportSuggestion: '{{library}}はdefaultインポートではなく、named importを使用してください。',
        treeshakingOptimization: '{{library}}はtree-shakingを考慮したインポートを使用してください。'
      }
    },

    create(context) {
      const HEAVY_LIBRARIES = {
        'lodash': {
          type: 'utility',
          suggestion: "import { debounce } from 'lodash/debounce'",
          alternative: 'lodash-es or individual functions'
        },
        'moment': {
          type: 'date',
          suggestion: 'date-fns or dayjs',
          alternative: 'Smaller date libraries'
        },
        'rxjs': {
          type: 'reactive',
          suggestion: "import { Observable } from 'rxjs'",
          alternative: 'Individual operators'
        },
        '@tanstack/react-query': {
          type: 'data-fetching',
          suggestion: "import { useQuery } from '@tanstack/react-query'",
          alternative: 'Specific hooks only'
        }
      };

      const TREE_SHAKABLE_LIBRARIES = [
        'date-fns',
        'ramda',
        'lodash-es'
      ];

      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          
          // 重いライブラリのチェック
          if (HEAVY_LIBRARIES[source]) {
            const _library = HEAVY_LIBRARIES[source];
            
            // default importの場合
            if (node.specifiers.some(spec => spec.type === 'ImportDefaultSpecifier')) {
              context.report({
                node,
                messageId: 'defaultImportSuggestion',
                data: { library: source },
                fix(fixer) {
                  // 自動修正の提案（簡単な場合のみ）
                  if (source === 'lodash' && node.specifiers.length === 1) {
                    return fixer.replaceText(node, `import { /* specify functions */ } from '${source}'`);
                  }
                }
              });
            }

            // namespace importの場合
            if (node.specifiers.some(spec => spec.type === 'ImportNamespaceSpecifier')) {
              context.report({
                node,
                messageId: 'entireLibraryImport',
                data: { library: source }
              });
            }
          }

          // Tree-shakable librariesのoptimization
          if (TREE_SHAKABLE_LIBRARIES.includes(source)) {
            if (node.specifiers.some(spec => spec.type === 'ImportNamespaceSpecifier')) {
              context.report({
                node,
                messageId: 'treeshakingOptimization',
                data: { library: source }
              });
            }
          }

          // BoxLog特有のルール
          if (source.startsWith('@/features/')) {
            // feature間の相互依存チェック
            const currentFile = context.getFilename();
            const currentFeature = currentFile.match(/src\/features\/([^\/]+)/)?.[1];
            const importedFeature = source.match(/@\/features\/([^\/]+)/)?.[1];
            
            if (currentFeature && importedFeature && currentFeature !== importedFeature) {
              context.report({
                node,
                messageId: 'heavyLibraryImport',
                data: { library: `feature/${importedFeature}` }
              });
            }
          }
        }
      };
    }
  },

  'prefer-dynamic-imports': {
    meta: {
      type: 'suggestion',
      docs: {
        description: '大きなコンポーネントに動的インポートを推奨',
        category: 'Bundle Size',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        shouldUseDynamicImport: '{{componentName}}は大きなコンポーネントです。React.lazyでの動的インポートを検討してください。',
        shouldUseNextDynamic: 'Next.js環境では、next/dynamicの使用を検討してください。'
      }
    },

    create(context) {
      const LARGE_COMPONENTS = [
        'Calendar',
        'Chart',
        'Editor',
        'Kanban',
        'Dashboard',
        'DataTable'
      ];

      const HEAVY_UI_LIBRARIES = [
        '@tiptap',
        'react-big-calendar',
        '@dnd-kit',
        'react-chartjs-2'
      ];

      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          
          // 重いUIライブラリのチェック
          if (HEAVY_UI_LIBRARIES.some(lib => source.includes(lib))) {
            const filename = context.getFilename();
            
            // ページコンポーネントでない場合は動的インポートを推奨
            if (!filename.includes('/pages/') && !filename.includes('/app/')) {
              context.report({
                node,
                messageId: 'shouldUseDynamicImport',
                data: { componentName: source }
              });
            }
          }

          // 大きなコンポーネントのインポート
          node.specifiers.forEach(spec => {
            if (spec.type === 'ImportDefaultSpecifier') {
              const componentName = spec.local.name;
              
              if (LARGE_COMPONENTS.some(comp => componentName.includes(comp))) {
                context.report({
                  node,
                  messageId: 'shouldUseDynamicImport',
                  data: { componentName }
                });
              }
            }
          });
        }
      };
    }
  },

  'no-barrel-file-abuse': {
    meta: {
      type: 'problem',
      docs: {
        description: 'バレルファイルの不適切な使用を防止',
        category: 'Bundle Size',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        avoidBarrelImport: 'バレルファイル（{{barrel}}）からの大量インポートは避けてください。直接インポートを検討してください。',
        tooManyImports: '{{count}}個の項目をインポートしています。バンドルサイズを考慮してください。'
      }
    },

    create(context) {
      const BARREL_PATTERNS = [
        /\/index\.(ts|tsx|js|jsx)$/,
        /components\/index/,
        /utils\/index/
      ];

      const MAX_IMPORTS_FROM_BARREL = 5;

      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          
          // バレルファイルかチェック
          const isBarrelFile = BARREL_PATTERNS.some(pattern => pattern.test(source));
          
          if (isBarrelFile) {
            const namedImports = node.specifiers.filter(spec => 
              spec.type === 'ImportSpecifier'
            ).length;
            
            if (namedImports > MAX_IMPORTS_FROM_BARREL) {
              context.report({
                node,
                messageId: 'tooManyImports',
                data: { count: namedImports }
              });
            }
          }
        }
      };
    }
  },

  'optimize-reexports': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Re-exportの最適化を推奨',
        category: 'Bundle Size',
        recommended: true
      },
      fixable: 'code',
      schema: [],
      messages: {
        optimizeReexport: 'Re-exportではなく直接exportを検討してください。',
        unnecessaryReexport: '不要なre-exportです。直接インポートしてください。'
      }
    },

    create(context) {
      return {
        ExportAllDeclaration(node) {
          context.report({
            node,
            messageId: 'optimizeReexport',
            fix(fixer) {
              // export * を specific exportsに変換する提案
              return fixer.replaceText(
                node, 
                `// TODO: Replace with specific exports for better tree-shaking\n${node.source.raw}`
              );
            }
          });
        },

        ExportNamedDeclaration(node) {
          // re-exportのチェック
          if (node.source && node.specifiers.length === 1) {
            const spec = node.specifiers[0];
            if (spec.exported.name === spec.local.name) {
              context.report({
                node,
                messageId: 'unnecessaryReexport'
              });
            }
          }
        }
      };
    }
  }
};