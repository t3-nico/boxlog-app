#!/usr/bin/env node

/**
 * Theme違反検出スクリプト
 * 直接Tailwindクラスの使用を検出してレポートします
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 検出対象のパターン（正規表現）
const VIOLATION_PATTERNS = [
  // 背景色の直接指定
  /className={[^}]*["'`][^"'`]*\bbg-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+[^"'`]*["'`]/g,
  
  // テキスト色の直接指定  
  /className={[^}]*["'`][^"'`]*\btext-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+[^"'`]*["'`]/g,
  
  // ボーダー色の直接指定
  /className={[^}]*["'`][^"'`]*\bborder-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+[^"'`]*["'`]/g,
  
  // ホバー色の直接指定
  /className={[^}]*["'`][^"'`]*\bhover:bg-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+[^"'`]*["'`]/g,
  
  // ダークモード色の直接指定
  /className={[^}]*["'`][^"'`]*\bdark:(bg|text|border)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+[^"'`]*["'`]/g,
];

// 除外ファイル
const EXCLUDED_PATHS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'src/config/theme', // theme定義自体は除外
  'src/components/shadcn-ui', // shadcn/uiは一旦除外（後で対応）
];

// カウンター
let totalViolations = 0;
let checkedFiles = 0;

/**
 * ファイルをスキャンして違反を検出
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    VIOLATION_PATTERNS.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lineNumber - 1].trim();
        
        violations.push({
          type: getViolationType(index),
          line: lineNumber,
          content: lineContent,
          match: match[0]
        });
      }
    });
    
    if (violations.length > 0) {
      console.log(`\n❌ ${filePath}`);
      violations.forEach(v => {
        console.log(`   Line ${v.line}: ${v.type}`);
        console.log(`   Found: ${v.match}`);
        console.log(`   Context: ${v.content.substring(0, 100)}...`);
      });
      totalViolations += violations.length;
    }
    
    checkedFiles++;
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

/**
 * 違反タイプを取得
 */
function getViolationType(patternIndex) {
  const types = [
    '背景色の直接指定',
    'テキスト色の直接指定',
    'ボーダー色の直接指定', 
    'ホバー色の直接指定',
    'ダークモード色の直接指定'
  ];
  return types[patternIndex] || '未知の違反';
}

/**
 * ディレクトリを再帰的にスキャン
 */
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);
    
    // 除外パスのチェック
    if (EXCLUDED_PATHS.some(excluded => relativePath.includes(excluded))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      scanFile(fullPath);
    }
  }
}

/**
 * メイン実行
 */
function main() {
  console.log('🔍 BoxLog Theme違反チェックを開始...\n');
  console.log('チェック対象:');
  console.log('  - 直接Tailwind色クラスの使用');
  console.log('  - theme経由でない色指定');
  console.log('  - ダークモード個別指定\n');
  
  const startTime = Date.now();
  
  // srcディレクトリをスキャン
  scanDirectory('src');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`\n${  '='.repeat(60)}`);
  console.log('📊 スキャン結果');
  console.log('='.repeat(60));
  console.log(`チェックファイル数: ${checkedFiles}`);
  console.log(`発見した違反数: ${totalViolations}`);
  console.log(`実行時間: ${duration}ms`);
  
  if (totalViolations > 0) {
    console.log('\n💡 修正方法:');
    console.log('  1. 直接色指定 → colors.{category}.{variant} を使用');
    console.log('  2. theme定義の確認: src/config/theme/colors.ts');
    console.log('  3. 例: bg-blue-600 → colors.primary.DEFAULT');
    
    process.exit(1); // CIで失敗させる
  } else {
    console.log('\n✅ 違反は見つかりませんでした！');
    process.exit(0);
  }
}

// CLI実行時
if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory };