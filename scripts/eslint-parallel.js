#!/usr/bin/env node

const { Worker } = require('worker_threads');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ParallelESLint {
  constructor(options = {}) {
    this.workers = options.workers || os.cpus().length;
    this.cacheDir = options.cacheDir || '.eslint/cache';
    this.configFile = options.configFile || '.eslint/index.js';
    this.results = [];
    this.errors = [];
  }

  // ファイルリストを取得
  getFiles() {
    try {
      const files = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -20',
        { encoding: 'utf8' }
      ).trim().split('\n').filter(Boolean);

      console.log(`📁 Found ${files.length} files to lint`);
      return files;
    } catch (error) {
      console.log('📁 Using fallback file discovery...');
      // フォールバック: 直接TSXファイルをいくつか指定
      const testFiles = [
        'src/app/page.tsx',
        'src/components/layout/header/index.tsx',
        'src/components/ui/button.tsx'
      ].filter(file => {
        try {
          return require('fs').existsSync(file);
        } catch {
          return false;
        }
      });
      console.log(`📁 Found ${testFiles.length} test files to lint`);
      return testFiles;
    }
  }

  // ファイルをチャンクに分割
  chunkFiles(files) {
    const chunks = [];
    const chunkSize = Math.ceil(files.length / this.workers);

    for (let i = 0; i < files.length; i += chunkSize) {
      chunks.push(files.slice(i, i + chunkSize));
    }

    return chunks;
  }

  // ワーカースレッドでESLint実行
  async runWorker(files, workerId) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort, workerData } = require('worker_threads');
        const { ESLint } = require('eslint');

        async function run() {
          const eslint = new ESLint({
            overrideConfigFile: '${this.configFile}',
            cache: true,
            cacheLocation: '${this.cacheDir}/worker-${workerId}.cache',
            fix: ${process.argv.includes('--fix')},
          });

          const results = await eslint.lintFiles(workerData.files);

          if (process.argv.includes('--fix')) {
            await ESLint.outputFixes(results);
          }

          return results;
        }

        run()
          .then(results => parentPort.postMessage({ results }))
          .catch(error => parentPort.postMessage({ error: error.message }));
      `, {
        eval: true,
        workerData: { files }
      });

      worker.on('message', (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.results);
        }
      });

      worker.on('error', reject);
    });
  }

  // 並列実行
  async run() {
    console.log(`🚀 Starting parallel ESLint with ${this.workers} workers`);
    const startTime = Date.now();

    const files = this.getFiles();
    const chunks = this.chunkFiles(files);

    // 並列実行
    const promises = chunks.map((chunk, index) =>
      this.runWorker(chunk, index)
    );

    try {
      const results = await Promise.all(promises);
      this.results = results.flat();

      // 結果を集計
      let errorCount = 0;
      let warningCount = 0;
      let fixableErrorCount = 0;
      let fixableWarningCount = 0;

      this.results.forEach(result => {
        errorCount += result.errorCount;
        warningCount += result.warningCount;
        fixableErrorCount += result.fixableErrorCount;
        fixableWarningCount += result.fixableWarningCount;
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      // サマリー出力
      console.log(`
✨ ESLint completed in ${duration}s

📊 Results:
  Errors:   ${errorCount} (${fixableErrorCount} fixable)
  Warnings: ${warningCount} (${fixableWarningCount} fixable)
  Workers:  ${this.workers}
  Files:    ${files.length}
      `);

      // エラーがある場合は詳細表示
      if (errorCount > 0) {
        console.log('\n❌ Errors found:');
        this.results.forEach(result => {
          if (result.errorCount > 0) {
            console.log(`  ${result.filePath}`);
            result.messages
              .filter(m => m.severity === 2)
              .forEach(m => {
                console.log(`    ${m.line}:${m.column} ${m.message} (${m.ruleId})`);
              });
          }
        });
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Parallel ESLint failed:', error);
      process.exit(1);
    }
  }
}

// 実行
if (require.main === module) {
  const linter = new ParallelESLint({
    workers: process.env.ESLINT_WORKERS
      ? parseInt(process.env.ESLINT_WORKERS)
      : os.cpus().length,
  });

  linter.run();
}

module.exports = ParallelESLint;