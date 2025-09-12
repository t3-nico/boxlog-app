#!/usr/bin/env node

/**
 * ESLint Setup Script
 * 
 * カスタムルールのセットアップと初期化を行います
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

console.log('📦 BoxLog ESLint Setup');
console.log('='.repeat(50));

// 1. カスタムプラグインを node_modules にコピー
function setupCustomPlugins() {
  console.log('🔧 カスタムプラグインをセットアップ中...');
  
  const pluginSources = [
    { src: 'config/eslint/custom-rules/theme', dest: 'node_modules/eslint-plugin-boxlog-theme' },
    { src: 'config/eslint/custom-rules/compliance', dest: 'node_modules/eslint-plugin-boxlog-compliance' }
  ];
  
  pluginSources.forEach(({ src, dest }) => {
    const srcPath = path.join(rootDir, src);
    const destPath = path.join(rootDir, dest);
    
    try {
      // ディレクトリが存在しない場合は作成
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      // ファイルをコピー
      const files = fs.readdirSync(srcPath);
      files.forEach(file => {
        const srcFile = path.join(srcPath, file);
        const destFile = path.join(destPath, file);
        
        if (fs.statSync(srcFile).isFile()) {
          fs.copyFileSync(srcFile, destFile);
        } else if (fs.statSync(srcFile).isDirectory()) {
          // ディレクトリの場合は再帰的にコピー
          copyDirectory(srcFile, destFile);
        }
      });
      
      console.log(`   ✅ ${src} → ${dest}`);
    } catch (error) {
      console.log(`   ❌ ${src} の設定に失敗: ${error.message}`);
    }
  });
}

// ディレクトリの再帰的コピー
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    } else if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    }
  });
}

// 2. キャッシュディレクトリの初期化
function setupCache() {
  console.log('🗂️  キャッシュディレクトリを初期化中...');
  
  const cacheDir = path.join(rootDir, '.eslint/cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('   ✅ キャッシュディレクトリを作成');
  } else {
    console.log('   ✅ キャッシュディレクトリは既に存在');
  }
}

// 3. レポートディレクトリの初期化
function setupReports() {
  console.log('📊 レポートディレクトリを初期化中...');
  
  const reportsDir = path.join(rootDir, '.eslint/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log('   ✅ レポートディレクトリを作成');
  } else {
    console.log('   ✅ レポートディレクトリは既に存在');
  }
}

// 4. .gitignore の更新
function updateGitignore() {
  console.log('📝 .gitignore を更新中...');
  
  const gitignorePath = path.join(rootDir, '.gitignore');
  const eslintIgnores = [
    '',
    '# ESLint',
    '.eslint/cache/',
    '.eslint/reports/*.html',
    '.eslint/reports/*.json',
    '.eslintcache'
  ].join('\n');
  
  try {
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    // 既に追加済みかチェック
    if (!gitignoreContent.includes('.eslint/cache/')) {
      fs.appendFileSync(gitignorePath, eslintIgnores);
      console.log('   ✅ .gitignore に ESLint 設定を追加');
    } else {
      console.log('   ✅ .gitignore は既に設定済み');
    }
  } catch (error) {
    console.log(`   ⚠️  .gitignore の更新に失敗: ${error.message}`);
  }
}

// 5. 設定の検証
function validateSetup() {
  console.log('🔍 設定を検証中...');
  
  const requiredPaths = [
    '.eslint/index.js',
    '.eslint/configs/base.js',
    '.eslint/configs/development.js',
    '.eslint/configs/production.js',
    '.eslint/overrides/generated.js',
    '.eslint/overrides/legacy.js'
  ];
  
  let allValid = true;
  
  requiredPaths.forEach(p => {
    const fullPath = path.join(rootDir, p);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${p}`);
    } else {
      console.log(`   ❌ ${p} が見つかりません`);
      allValid = false;
    }
  });
  
  return allValid;
}

// メイン実行
async function main() {
  try {
    setupCustomPlugins();
    setupCache();
    setupReports();
    updateGitignore();
    
    const isValid = validateSetup();
    
    console.log('='.repeat(50));
    if (isValid) {
      console.log('🎉 ESLint セットアップが完了しました！');
      console.log('');
      console.log('次のコマンドでESLintを実行できます:');
      console.log('  npm run lint          # 新しい設定でリント実行');
      console.log('  npm run lint:cache     # キャッシュ付きで高速実行');
      console.log('  npm run lint:report    # HTMLレポート生成');
    } else {
      console.log('❌ セットアップに問題があります。上記のエラーを確認してください。');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 セットアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupCustomPlugins, setupCache, setupReports, updateGitignore, validateSetup };