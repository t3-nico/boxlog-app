#!/usr/bin/env node

/**
 * CSS生成スクリプト
 * TypeScriptの定義からCSS変数を生成し、globals.cssに書き込む
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  generateTailwindThemeVariables,
  generateLightModeVariables,
  generateDarkModeVariables,
  generateResponsiveVariables,
  formatCSSVariables,
} from './themes/css-variables'
// アニメーションシステムから直接インポート
import { microKeyframes } from './themes/animations/micro-interactions'
import { transitionKeyframes } from './themes/animations/page-transitions'
import { skeletonKeyframes } from './themes/animations/skeleton-loading'

// 統合キーフレームオブジェクト
const allKeyframes = {
  ...microKeyframes,
  ...transitionKeyframes,
  ...skeletonKeyframes,
}

// アニメーション設定
const animationConfig = {
  animation: {
    // マイクロインタラクション
    'micro-ripple': 'ripple 0.3s ease-out',
    'micro-shake': 'shake 0.5s ease-in-out',
    'micro-heartbeat': 'heartbeat 1s ease-in-out infinite',
    'micro-fade-in-up': 'fadeInUp 0.3s ease-out',
    'micro-rotate-in': 'rotateIn 0.5s ease-out',
    
    // ページ遷移
    'page-fade-in': 'fade-in 0.3s ease-out',
    'page-fade-out': 'fade-out 0.3s ease-out',
    'page-slide-in-right': 'slide-in-right 0.4s ease-out',
    'page-slide-out-left': 'slide-out-left 0.4s ease-out',
    'page-scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // モーダル
    'modal-scale-in': 'modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    'modal-slide-up': 'modal-slide-up 0.4s ease-out',
    'dropdown-in': 'dropdown-in 0.2s ease-out',
    
    // スケルトン
    'skeleton-wave': 'skeleton-wave 2s ease-in-out infinite',
    'skeleton-wave-fast': 'skeleton-wave-fast 1s ease-in-out infinite',
    'skeleton-fade': 'skeleton-fade 1.5s ease-in-out infinite',
    
    // エラー・ローディング
    'shake-x': 'shake-x 0.5s ease-in-out',
    'fade-in-error': 'fade-in-error 0.3s ease-out',
    'pulse-error': 'pulse-error 1s ease-in-out infinite',
    'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
  },
}


const GLOBALS_CSS_PATH = path.join(__dirname, 'globals.css')
const GENERATED_CSS_PATH = path.join(__dirname, 'generated-variables.css')

/**
 * 生成されたCSS変数ファイルの内容を作成
 */
const generateCSSContent = (): string => {
  const content: string[] = []
  
  // ヘッダー
  content.push(`/**
 * 自動生成されたCSS変数
 * このファイルは直接編集しないでください。
 * 変更はsrc/styles/themes/内のTypeScriptファイルで行ってください。
 * 生成日時: ${new Date().toISOString()}
 */

`)
  
  // Tailwind v4 @theme ディレクティブ
  content.push(`/* Tailwind v4 テーマ設定 - Compass Neutral カラーシステム */
@theme {
${generateTailwindThemeVariables()}
}

`)

  // アニメーションキーフレーム
  content.push(`/* アニメーションキーフレーム - BoxLog統一仕様 */
`)
  
  if (allKeyframes && typeof allKeyframes === 'object') {
    Object.entries(allKeyframes).forEach(([name, keyframe]) => {
      if (typeof keyframe === 'object' && keyframe !== null) {
        content.push(`@keyframes ${name} {
`)
        Object.entries(keyframe).forEach(([step, styles]) => {
          if (typeof styles === 'object' && styles !== null) {
            content.push(`  ${step} {
`)
            Object.entries(styles as Record<string, string>).forEach(([property, value]) => {
              content.push(`    ${property}: ${value};
`)
            })
            content.push(`  }
`)
          }
        })
        content.push(`}

`)
      }
    })
  } else {
    content.push(`/* アニメーションキーフレームが見つかりません */
`)
  }
  
  // アニメーション設定
  content.push(`/* アニメーション設定 */
`)
  
  if (animationConfig?.animation && typeof animationConfig.animation === 'object') {
    const animationClasses = Object.entries(animationConfig.animation).map(([name, value]) => 
      `.animate-${name} { animation: ${value}; }`
    ).join('\n')
    
    content.push(`${animationClasses}

`)
  } else {
    content.push(`/* アニメーション設定が見つかりません */

`)
  }
  
  // ダークモード変数
  const darkVars = generateDarkModeVariables()
  content.push(`/* Compass Neutral ダークモード */
[data-theme="dark"] {
${formatCSSVariables(darkVars)}
}

`)
  
  // システム設定に従うダークモード
  content.push(`/* システム設定に従う（Compass Neutral）*/
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
${formatCSSVariables(darkVars, '    ')}
  }
}

`)
  
  // レスポンシブ設定
  const mobileVars = generateResponsiveVariables('mobile')
  content.push(`/* レスポンシブ対応のカレンダー変数 */
@media (max-width: 639px) {
  :root {
${formatCSSVariables(mobileVars, '    ')}
  }
}

`)
  
  const tabletVars = generateResponsiveVariables('tablet')
  content.push(`@media (min-width: 640px) and (max-width: 1023px) {
  :root {
${formatCSSVariables(tabletVars, '    ')}
  }
}

`)
  
  // アクセシビリティ設定
  content.push(`/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  :root {
    --color-border: 0 0 0;
    --color-ring: 0 0 0;
  }
  
  [data-theme="dark"] {
    --color-border: 255 255 255;
    --color-ring: 255 255 255;
  }
}
`)
  
  return content.join('')
}

/**
 * globals.cssの自動生成部分を更新
 */
const updateGlobalsCss = () => {
  // globals.cssの現在の内容を読み込む
  const currentContent = fs.readFileSync(GLOBALS_CSS_PATH, 'utf-8')
  
  // カスタム部分（@layer以降）を保持
  const customPartMatch = currentContent.match(/\/\* ={5,} Base Layer Customizations ={5,} \*\/[\s\S]*$/m)
  const customPart = customPartMatch ? customPartMatch[0] : ''
  
  // 新しい内容を生成
  const generatedVariables = generateCSSContent()
  
  // 完全な新しいglobals.cssを生成
  const newContent = `/**
 * Global Styles - Tailwind CSS + Theme System Integration
 * BoxLog App - Main Stylesheet
 */

/* Tailwind CSS */
@import 'tailwindcss';

${generatedVariables}

${customPart}`
  
  // ファイルに書き込む
  fs.writeFileSync(GLOBALS_CSS_PATH, newContent, 'utf-8')
  console.log(`✅ ${GLOBALS_CSS_PATH} を更新しました`)
  
  // 生成された変数のみのファイルも作成（参照用）
  fs.writeFileSync(GENERATED_CSS_PATH, generatedVariables, 'utf-8')
  console.log(`✅ ${GENERATED_CSS_PATH} を生成しました`)
}

/**
 * エクスポート用index.tsを更新
 */
const updateIndexExports = () => {
  const indexPath = path.join(__dirname, 'themes', 'index.ts')
  const content = fs.readFileSync(indexPath, 'utf-8')
  
  // css-variables.tsのエクスポートが含まれているか確認
  if (!content.includes("from './css-variables'")) {
    // エクスポートセクションの最後に追加
    const updatedContent = content.replace(
      /\/\/ 型定義\nexport \* from '\.\/types'/,
      `// 型定義\nexport * from './types'\n\n// CSS変数生成\nexport * from './css-variables'`
    )
    
    fs.writeFileSync(indexPath, updatedContent, 'utf-8')
    console.log(`✅ ${indexPath} にcss-variablesエクスポートを追加しました`)
  }
}

/**
 * メイン処理
 */
const main = () => {
  try {
    console.log('🚀 CSS変数の生成を開始します...')
    
    // globals.cssを更新
    updateGlobalsCss()
    
    // index.tsを更新
    updateIndexExports()
    
    console.log('✨ CSS変数の生成が完了しました！')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプトとして実行された場合のみ実行
if (require.main === module) {
  main()
}

export { generateCSSContent, updateGlobalsCss }