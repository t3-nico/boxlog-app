/**
 * BoxLog Performance Optimization ESLint Rules
 * 
 * Reactアプリケーションのパフォーマンス最適化のためのカスタムルール
 */

module.exports = {
  'no-expensive-operations-in-render': {
    meta: {
      type: 'problem',
      docs: {
        description: 'レンダー内での重い処理を禁止',
        category: 'Performance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        expensiveOperation: 'レンダー関数内で重い処理（{{operation}}）が検出されました。useMemo/useCallbackの使用を検討してください。',
        arrayMethodInRender: '配列メソッド（{{method}}）がレンダー内で使用されています。useMemoでメモ化してください。',
        objectCreationInRender: 'オブジェクト作成がレンダー内で検出されました。useMemoでメモ化するか、コンポーネント外に移動してください。'
      }
    },

    create(context) {
      const EXPENSIVE_OPERATIONS = [
        'JSON.parse', 'JSON.stringify',
        'parseInt', 'parseFloat',
        'Date.parse', 'new Date',
        'Math.random', 'Math.floor', 'Math.ceil',
        'localStorage.getItem', 'sessionStorage.getItem'
      ];

      const EXPENSIVE_ARRAY_METHODS = [
        'map', 'filter', 'reduce', 'sort', 'reverse',
        'find', 'findIndex', 'some', 'every'
      ];

      let isInRenderFunction = false;
      let _currentFunctionName = '';

      return {
        FunctionDeclaration(node) {
          if (node.id && /^[A-Z]/.test(node.id.name)) {
            isInRenderFunction = true;
            currentFunctionName = node.id.name;
          }
        },

        'FunctionDeclaration:exit'(node) {
          if (node.id && /^[A-Z]/.test(node.id.name)) {
            isInRenderFunction = false;
            currentFunctionName = '';
          }
        },

        ArrowFunctionExpression(node) {
          // Reactコンポーネントかどうかの簡易判定
          if (node.parent.type === 'VariableDeclarator' && 
              node.parent.id.name && 
              /^[A-Z]/.test(node.parent.id.name)) {
            isInRenderFunction = true;
            currentFunctionName = node.parent.id.name;
          }
        },

        'ArrowFunctionExpression:exit'(node) {
          if (node.parent.type === 'VariableDeclarator' && 
              node.parent.id.name && 
              /^[A-Z]/.test(node.parent.id.name)) {
            isInRenderFunction = false;
            currentFunctionName = '';
          }
        },

        CallExpression(node) {
          if (!isInRenderFunction) return;

          const calleeName = node.callee.name || 
            (node.callee.property && node.callee.property.name) ||
            (node.callee.type === 'MemberExpression' && 
             `${node.callee.object.name}.${node.callee.property.name}`);

          // 重い処理の検出
          if (EXPENSIVE_OPERATIONS.includes(calleeName)) {
            context.report({
              node,
              messageId: 'expensiveOperation',
              data: { operation: calleeName }
            });
          }

          // 配列メソッドの検出
          if (node.callee.type === 'MemberExpression' && 
              EXPENSIVE_ARRAY_METHODS.includes(node.callee.property.name)) {
            context.report({
              node,
              messageId: 'arrayMethodInRender',
              data: { method: node.callee.property.name }
            });
          }
        },

        ObjectExpression(node) {
          if (!isInRenderFunction) return;

          // JSX props内のオブジェクト作成をチェック
          if (node.parent.type === 'JSXExpressionContainer') {
            context.report({
              node,
              messageId: 'objectCreationInRender'
            });
          }
        },

        ArrayExpression(node) {
          if (!isInRenderFunction) return;

          // JSX props内の配列作成をチェック
          if (node.parent.type === 'JSXExpressionContainer' && node.elements.length > 3) {
            context.report({
              node,
              messageId: 'objectCreationInRender'
            });
          }
        }
      };
    }
  },

  'require-memo-for-complex-components': {
    meta: {
      type: 'suggestion',
      docs: {
        description: '複雑なコンポーネントにReact.memoの使用を推奨',
        category: 'Performance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        shouldUseMemo: 'このコンポーネント（{{componentName}}）は複雑です。React.memoの使用を検討してください。',
        shouldUseCallback: 'この関数プロパティはuseCallbackでメモ化することを推奨します。'
      }
    },

    create(context) {
      let componentComplexity = 0;
      let componentName = '';
      let hasMemo = false;

      return {
        FunctionDeclaration(node) {
          if (node.id && /^[A-Z]/.test(node.id.name)) {
            componentName = node.id.name;
            componentComplexity = 0;
            hasMemo = false;
          }
        },

        ArrowFunctionExpression(node) {
          if (node.parent.type === 'VariableDeclarator' && 
              node.parent.id.name && 
              /^[A-Z]/.test(node.parent.id.name)) {
            componentName = node.parent.id.name;
            componentComplexity = 0;
            hasMemo = false;
          }
        },

        CallExpression(node) {
          if (node.callee.name === 'memo' || 
              (node.callee.property && node.callee.property.name === 'memo')) {
            hasMemo = true;
          }

          // 複雑度を増加させる要素
          if (node.callee.name === 'useState' || 
              node.callee.name === 'useEffect' ||
              node.callee.name === 'useCallback' ||
              node.callee.name === 'useMemo') {
            componentComplexity += 2;
          }
        },

        JSXElement(_node) {
          componentComplexity += 1;
        },

        ConditionalExpression(_node) {
          componentComplexity += 1;
        },

        LogicalExpression(node) {
          if (node.operator === '&&' || node.operator === '||') {
            componentComplexity += 1;
          }
        },

        'FunctionDeclaration:exit'(node) {
          if (node.id && /^[A-Z]/.test(node.id.name)) {
            if (componentComplexity > 10 && !hasMemo) {
              context.report({
                node,
                messageId: 'shouldUseMemo',
                data: { componentName }
              });
            }
          }
        },

        'ArrowFunctionExpression:exit'(node) {
          if (node.parent.type === 'VariableDeclarator' && 
              node.parent.id.name && 
              /^[A-Z]/.test(node.parent.id.name)) {
            if (componentComplexity > 10 && !hasMemo) {
              context.report({
                node,
                messageId: 'shouldUseMemo',
                data: { componentName }
              });
            }
          }
        }
      };
    }
  },

  'no-inline-styles': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'インラインスタイルの使用を禁止（パフォーマンス最適化）',
        category: 'Performance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        noInlineStyle: 'インラインスタイルはパフォーマンスに影響します。CSS-in-JSやクラス名を使用してください。',
        noInlineObject: 'インライン オブジェクトは毎回新しく作成されます。定数として外部に定義してください。'
      }
    },

    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name === 'style' && 
              node.value && 
              node.value.type === 'JSXExpressionContainer') {
            
            if (node.value.expression.type === 'ObjectExpression') {
              context.report({
                node,
                messageId: 'noInlineStyle'
              });
            }
          }
        },

        JSXExpressionContainer(node) {
          if (node.expression.type === 'ObjectExpression' && 
              node.parent.type === 'JSXAttribute') {
            
            // style属性以外でもオブジェクトのインライン作成を警告
            if (node.parent.name.name !== 'style') {
              context.report({
                node,
                messageId: 'noInlineObject'
              });
            }
          }
        }
      };
    }
  }
};