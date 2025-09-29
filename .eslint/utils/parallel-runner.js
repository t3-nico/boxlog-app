/**
 * ESLint並列実行システム
 *
 * 特徴:
 * - ファイル分割による並列処理
 * - CPU コア数に応じた最適化
 * - プログレスバー表示
 * - エラー集約・レポート
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// CPUコア数を取得（最大8並列）
const getConcurrency = () => {
  const cores = os.cpus().length;
  return Math.min(cores, 8);
};

// ファイルリストを取得
const getTargetFiles = (patterns = ['src/**/*.{ts,tsx,js,jsx}']) => {
  try {
    const result = execSync(`find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return result.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

// ファイルをバッチに分割
const createBatches = (files, batchCount) => {
  const batches = Array.from({ length: batchCount }, () => []);
  files.forEach((file, index) => {
    batches[index % batchCount].push(file);
  });
  return batches.filter(batch => batch.length > 0);
};

// 単一バッチのESLint実行
const runESLintBatch = async (files, batchId, options = {}) => {
  const {
    fix = false,
    outputFile = null,
    quiet = false
  } = options;

  return new Promise((resolve, reject) => {
    const args = [
      'eslint',
      ...files,
      '--format', 'json',
      fix ? '--fix' : '',
      quiet ? '--quiet' : '',
    ].filter(Boolean);

    const child = spawn('npx', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      try {
        const results = JSON.parse(stdout || '[]');

        // 結果をファイルに保存（並列処理用）
        if (outputFile) {
          fs.writeFileSync(`${outputFile}.${batchId}.json`, JSON.stringify(results, null, 2));
        }

        resolve({
          batchId,
          results,
          code,
          files: files.length,
          errors: results.reduce((sum, file) => sum + file.errorCount, 0),
          warnings: results.reduce((sum, file) => sum + file.warningCount, 0),
        });
      } catch (error) {
        reject({
          batchId,
          error: error.message,
          stderr,
          files: files.length,
        });
      }
    });

    child.on('error', (error) => {
      reject({
        batchId,
        error: error.message,
        files: files.length,
      });
    });
  });
};

// プログレスバー表示
const showProgress = (completed, total, duration) => {
  const percentage = Math.floor((completed / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  const timePerBatch = duration / completed;
  const eta = Math.floor((total - completed) * timePerBatch / 1000);

  process.stdout.write(`\r[${bar}] ${percentage}% (${completed}/${total}) ETA: ${eta}s`);
};

// 結果集約
const aggregateResults = (batchResults) => {
  const allResults = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;

  batchResults.forEach(batch => {
    if (batch.results) {
      allResults.push(...batch.results);
      totalErrors += batch.errors;
      totalWarnings += batch.warnings;
      totalFiles += batch.files;
    }
  });

  return {
    results: allResults,
    summary: {
      files: totalFiles,
      errors: totalErrors,
      warnings: totalWarnings,
      batches: batchResults.length,
    }
  };
};

// メイン並列実行関数
const runParallelESLint = async (options = {}) => {
  const {
    patterns = ['src/**/*.{ts,tsx,js,jsx}'],
    fix = false,
    quiet = false,
    outputDir = '.eslint/cache'
  } = options;

  console.log('🚀 ESLint並列実行開始...');

  // ファイル取得
  const files = getTargetFiles(patterns);
  if (files.length === 0) {
    console.log('⚠️  対象ファイルが見つかりません');
    return { results: [], summary: { files: 0, errors: 0, warnings: 0 } };
  }

  // 並列度決定
  const concurrency = getConcurrency();
  const batches = createBatches(files, concurrency);

  console.log(`📊 並列実行設定:`);
  console.log(`   - ファイル数: ${files.length}`);
  console.log(`   - 並列度: ${concurrency}`);
  console.log(`   - バッチ数: ${batches.length}`);
  console.log('');

  // 出力ディレクトリ作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 並列実行
  const startTime = Date.now();
  const promises = batches.map((batch, index) =>
    runESLintBatch(batch, index, {
      fix,
      quiet,
      outputFile: path.join(outputDir, 'batch-results')
    })
  );

  // プログレス監視
  const progressInterval = setInterval(() => {
    const completed = promises.filter(p => p.isFulfilled || p.isRejected).length;
    showProgress(completed, promises.length, Date.now() - startTime);
  }, 500);

  // 実行完了待機
  const results = await Promise.allSettled(promises);
  clearInterval(progressInterval);
  process.stdout.write('\n');

  // 結果処理
  const batchResults = results.map(result =>
    result.status === 'fulfilled' ? result.value : result.reason
  );

  const aggregated = aggregateResults(batchResults.filter(r => r.results));
  const duration = Date.now() - startTime;

  // 結果表示
  console.log(`✅ 並列実行完了 (${duration}ms)`);
  console.log(`📈 結果サマリー:`);
  console.log(`   - ファイル数: ${aggregated.summary.files}`);
  console.log(`   - エラー: ${aggregated.summary.errors}`);
  console.log(`   - 警告: ${aggregated.summary.warnings}`);
  console.log(`   - 処理速度: ${Math.floor(aggregated.summary.files / (duration / 1000))} files/sec`);

  // エラーがある場合の詳細表示
  if (aggregated.summary.errors > 0) {
    console.log(`\n❌ エラー詳細:`);
    aggregated.results.forEach(file => {
      if (file.errorCount > 0) {
        console.log(`   ${file.filePath}: ${file.errorCount} errors`);
      }
    });
  }

  return aggregated;
};

module.exports = {
  runParallelESLint,
  getConcurrency,
  getTargetFiles,
  createBatches,
};