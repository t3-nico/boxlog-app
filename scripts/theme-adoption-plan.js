#!/usr/bin/env node

/**
 * テーマ導入の現実的な計画を提示するスクリプト
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 BoxLog テーマ導入計画');
console.log('='.repeat(50));

// 現在のテーマ違反ファイル数を取得
function getThemeViolations() {
  try {
    const output = execSync('find src -name "*.tsx" -exec grep -l "bg-red\\|bg-blue\\|bg-green\\|text-gray\\|border-gray" {} \\;', 
      { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f);
  } catch {
    return [];
  }
}

const violationFiles = getThemeViolations();

console.log('📊 現状分析');
console.log(`違反ファイル数: ${violationFiles.length}個`);
console.log(`修正済み: 1個 (src/app/error/page.tsx)`);
console.log(`残り: ${violationFiles.length - 1}個`);

console.log('\n🎯 推奨アプローチ');
console.log('1. 【即座実行】新規ファイルのみテーマ強制');
console.log('2. 【段階的】既存ファイルは機会主義的修正');
console.log('3. 【将来】CI/CDで新規ファイル検出＆強制');

console.log('\n📋 具体的なアクション');
console.log('A. 開発環境: テーマルール無効（ビルドブロッカー回避）');
console.log('B. 新規ファイル: プルリクエスト時にテーマチェック');
console.log('C. 既存ファイル: 修正時に可能な範囲で適用');

console.log('\n🚀 次のステップ');
console.log('1. next.config.mjs で開発ビルド時ESLint無効維持');
console.log('2. pre-commit フックで新規ファイルのみチェック');
console.log('3. 1週間で5-10ファイル程度の段階的修正');

console.log('\n⚡ 推奨設定');
console.log('- 開発: テーマ警告のみ（ビルド継続）');
console.log('- PR: 新規/修正ファイルのみ厳格チェック');
console.log('- 本番: 修正済みファイルのみ厳格適用');

console.log('\n' + '='.repeat(50));
console.log('現実的で持続可能な移行計画を選択してください');