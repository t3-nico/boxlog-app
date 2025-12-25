/**
 * 🔍 Breaking Changes Detector
 *
 * 破壊的変更の自動検知・分析システム
 * - Git diff解析・API変更検知・設定変更追跡
 */

import { execSync } from 'child_process';

import type { AffectedGroup, ImpactLevel } from './types';

/**
 * 🔍 変更検知結果
 */
export interface DetectedChange {
  /** ファイルパス */
  filePath: string;
  /** 変更タイプ */
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';
  /** 変更内容 */
  diff: string;
  /** 破壊的変更の可能性 */
  isBreaking: boolean;
  /** 信頼度スコア（0-1） */
  confidence: number;
  /** 検知理由 */
  reasons: string[];
  /** 推定影響範囲 */
  suggestedImpact: ImpactLevel;
  /** 推定対象グループ */
  suggestedGroups: AffectedGroup[];
}

/**
 * 🎯 Breaking Change検知エンジン
 */
export class BreakingChangeDetector {
  private patterns: DetectionPattern[];

  constructor() {
    this.patterns = this.initializeDetectionPatterns();
  }

  /**
   * 📊 Git diff から破壊的変更を検知
   */
  async detectFromGitDiff(
    fromCommit: string = 'HEAD~1',
    toCommit: string = 'HEAD',
  ): Promise<DetectedChange[]> {
    try {
      // Git diff の取得
      const diffOutput = execSync(`git diff ${fromCommit}..${toCommit} --name-status`, {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      const changedFiles = this.parseGitDiffOutput(diffOutput);
      const detectedChanges: DetectedChange[] = [];

      for (const file of changedFiles) {
        const fileDiff = execSync(`git diff ${fromCommit}..${toCommit} -- "${file.path}"`, {
          encoding: 'utf8',
          cwd: process.cwd(),
        });

        const detection = await this.analyzeFileDiff(
          file.path,
          fileDiff,
          file.status as 'A' | 'M' | 'D' | 'R',
        );
        if (detection) {
          detectedChanges.push(detection);
        }
      }

      return detectedChanges.filter((change) => change.isBreaking);
    } catch (error) {
      console.error('Git diff analysis failed:', error);
      return [];
    }
  }

  /**
   * 📁 ファイル変更の分析
   */
  private async analyzeFileDiff(
    filePath: string,
    diff: string,
    changeType: 'A' | 'M' | 'D' | 'R',
  ): Promise<DetectedChange | null> {
    const reasons: string[] = [];
    let isBreaking = false;
    let confidence = 0;
    let suggestedImpact: ImpactLevel = 'low';
    let suggestedGroups: AffectedGroup[] = [];

    // パターンマッチング
    for (const pattern of this.patterns) {
      if (this.matchesPattern(filePath, diff, pattern)) {
        isBreaking = true;
        confidence = Math.max(confidence, pattern.confidence);
        reasons.push(pattern.reason);

        // 影響度の更新（より高い影響度を採用）
        if (this.getImpactWeight(pattern.impact) > this.getImpactWeight(suggestedImpact)) {
          suggestedImpact = pattern.impact;
        }

        // 対象グループの統合
        suggestedGroups = [...new Set([...suggestedGroups, ...pattern.affectedGroups])];
      }
    }

    // 特定のファイルタイプ別追加分析
    if (filePath.includes('package.json')) {
      const packageAnalysis = this.analyzePackageJsonChanges(diff);
      if (packageAnalysis.isBreaking) {
        isBreaking = true;
        confidence = Math.max(confidence, packageAnalysis.confidence);
        reasons.push(...packageAnalysis.reasons);
      }
    }

    if (filePath.includes('/api/') && filePath.endsWith('.ts')) {
      const apiAnalysis = this.analyzeApiChanges(diff);
      if (apiAnalysis.isBreaking) {
        isBreaking = true;
        confidence = Math.max(confidence, apiAnalysis.confidence);
        reasons.push(...apiAnalysis.reasons);
        suggestedGroups = [...new Set<AffectedGroup>([...suggestedGroups, 'api_consumers'])];
      }
    }

    if (!isBreaking) {
      return null;
    }

    return {
      filePath,
      changeType: this.mapGitStatusToChangeType(changeType),
      diff,
      isBreaking,
      confidence,
      reasons,
      suggestedImpact,
      suggestedGroups,
    };
  }

  /**
   * 📦 package.json 変更の分析
   */
  private analyzePackageJsonChanges(diff: string): {
    isBreaking: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isBreaking = false;
    let confidence = 0;

    // メジャーバージョンアップの検知
    const majorVersionPattern =
      /"[^"]+": "(?:\^|~)?(\d+)\.\d+\.\d+".*-.*"(?:\^|~)?(\d+)\.\d+\.\d+"/g;
    let match;
    while ((match = majorVersionPattern.exec(diff)) !== null) {
      const oldMajor = parseInt(match[1] ?? '0', 10);
      const newMajor = parseInt(match[2] ?? '0', 10);
      if (newMajor > oldMajor) {
        isBreaking = true;
        confidence = Math.max(confidence, 0.8);
        reasons.push(`Dependency major version upgrade detected (${oldMajor}.x → ${newMajor}.x)`);
      }
    }

    // Node.js バージョン変更
    if (diff.includes('"node":') || diff.includes('"engines":')) {
      isBreaking = true;
      confidence = Math.max(confidence, 0.9);
      reasons.push('Node.js version requirement changed');
    }

    // 必須依存関係の削除
    const removedDependencies = diff.match(/-\s*"[^"]+": "[^"]+"/g);
    if (removedDependencies && removedDependencies.length > 0) {
      isBreaking = true;
      confidence = Math.max(confidence, 0.7);
      reasons.push(`Dependencies removed: ${removedDependencies.length} packages`);
    }

    return { isBreaking, confidence, reasons };
  }

  /**
   * 🔌 API変更の分析
   */
  private analyzeApiChanges(diff: string): {
    isBreaking: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isBreaking = false;
    let confidence = 0;

    // APIエンドポイントの削除
    if (diff.includes('-export async function') || diff.includes('-export function')) {
      isBreaking = true;
      confidence = Math.max(confidence, 0.9);
      reasons.push('API endpoint function removed');
    }

    // レスポンス型の変更
    if (diff.includes('interface') && (diff.includes('-') || diff.includes('+'))) {
      const interfaceChanges = diff.match(/[+-]\s*\w+:.*[;}]/g);
      if (interfaceChanges && interfaceChanges.length > 0) {
        isBreaking = true;
        confidence = Math.max(confidence, 0.8);
        reasons.push('API response interface changed');
      }
    }

    // HTTPメソッドの変更
    const httpMethodPattern = /[+-].*export async function (GET|POST|PUT|DELETE|PATCH)/g;
    const methodChanges = diff.match(httpMethodPattern);
    if (methodChanges && methodChanges.length > 0) {
      isBreaking = true;
      confidence = Math.max(confidence, 0.9);
      reasons.push('HTTP method changed or removed');
    }

    // 必須パラメータの追加
    if (diff.includes('+') && diff.includes('required:') && diff.includes('true')) {
      isBreaking = true;
      confidence = Math.max(confidence, 0.8);
      reasons.push('Required parameter added to API');
    }

    return { isBreaking, confidence, reasons };
  }

  /**
   * 🎯 検知パターンの初期化
   */
  private initializeDetectionPatterns(): DetectionPattern[] {
    return [
      // データベーススキーマ変更
      {
        filePatterns: [/migrations\/.*\.sql$/, /schema\.prisma$/, /database\/.*\.ts$/],
        diffPatterns: [/DROP TABLE/, /ALTER TABLE.*DROP/, /DROP COLUMN/],
        confidence: 0.9,
        impact: 'critical',
        affectedGroups: ['developers', 'devops', 'administrators'],
        reason: 'Database schema breaking change detected',
      },

      // 設定ファイル構造変更
      {
        filePatterns: [/config\/.*\.json$/, /\.env\.example$/],
        diffPatterns: [/-\s*"[^"]+":/, /REQUIRED.*removed/i],
        confidence: 0.8,
        impact: 'high',
        affectedGroups: ['developers', 'devops'],
        reason: 'Configuration structure changed',
      },

      // Next.js設定変更
      {
        filePatterns: [/next\.config\.(js|ts)$/, /tailwind\.config\.(js|ts)$/],
        diffPatterns: [/-.*module\.exports/, /experimental:.*-/],
        confidence: 0.7,
        impact: 'medium',
        affectedGroups: ['developers'],
        reason: 'Build configuration changed',
      },

      // TypeScript型定義の破壊的変更
      {
        filePatterns: [/types\/.*\.ts$/, /.*\.d\.ts$/],
        diffPatterns: [/-\s*export (interface|type)/, /[+-].*:\s*(string|number)\s*\|/],
        confidence: 0.8,
        impact: 'high',
        affectedGroups: ['developers', 'api_consumers'],
        reason: 'TypeScript type definition breaking change',
      },

      // 認証・セキュリティ関連
      {
        filePatterns: [/auth\/.*\.ts$/, /middleware\.ts$/, /.*security.*\.ts$/],
        diffPatterns: [/JWT.*changed/, /auth.*method.*removed/, /-.*authenticate/],
        confidence: 0.9,
        impact: 'critical',
        affectedGroups: ['developers', 'api_consumers', 'end_users'],
        reason: 'Authentication or security mechanism changed',
      },

      // UI/UXコンポーネントの大幅変更
      {
        filePatterns: [/components\/.*\.(tsx|jsx)$/],
        diffPatterns: [/-.*export.*function/, /props.*removed/, /-.*interface.*Props/],
        confidence: 0.6,
        impact: 'medium',
        affectedGroups: ['developers', 'end_users'],
        reason: 'UI component interface changed',
      },

      // ルーティング変更
      {
        filePatterns: [/app\/.*\/route\.ts$/, /pages\/.*\.(ts|tsx)$/],
        diffPatterns: [/-export.*function/, /pathname.*changed/, /-.*\/api\//],
        confidence: 0.8,
        impact: 'high',
        affectedGroups: ['api_consumers', 'external_systems'],
        reason: 'API route or page routing changed',
      },
    ];
  }

  /**
   * 🎯 パターンマッチング
   */
  private matchesPattern(filePath: string, diff: string, pattern: DetectionPattern): boolean {
    // ファイルパスのマッチング
    const fileMatches = pattern.filePatterns.some((filePattern) => filePattern.test(filePath));
    if (!fileMatches) {
      return false;
    }

    // Diff内容のマッチング
    return pattern.diffPatterns.some((diffPattern) => diffPattern.test(diff));
  }

  /**
   * 📊 影響度の重み
   */
  private getImpactWeight(impact: ImpactLevel): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[impact];
  }

  /**
   * 🔄 Git status のマッピング
   */
  private mapGitStatusToChangeType(status: string): 'added' | 'modified' | 'deleted' | 'renamed' {
    switch (status) {
      case 'A':
        return 'added';
      case 'M':
        return 'modified';
      case 'D':
        return 'deleted';
      case 'R':
        return 'renamed';
      default:
        return 'modified';
    }
  }

  /**
   * 🔍 Git diff出力の解析
   */
  private parseGitDiffOutput(diffOutput: string): Array<{ path: string; status: string }> {
    return diffOutput
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [status, path] = line.split('\t');
        return { path: path ?? '', status: status ?? '' };
      });
  }

  /**
   * 📋 検知結果のフィルタリング
   */
  filterByConfidence(changes: DetectedChange[], minConfidence: number = 0.7): DetectedChange[] {
    return changes.filter((change) => change.confidence >= minConfidence);
  }

  /**
   * 📊 検知結果の統計
   */
  getDetectionStats(changes: DetectedChange[]): {
    total: number;
    byImpact: Record<ImpactLevel, number>;
    byConfidence: { high: number; medium: number; low: number };
    averageConfidence: number;
  } {
    const byImpact: Record<ImpactLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let totalConfidence = 0;
    let highConfidence = 0;
    let mediumConfidence = 0;
    let lowConfidence = 0;

    changes.forEach((change) => {
      byImpact[change.suggestedImpact]++;
      totalConfidence += change.confidence;

      if (change.confidence >= 0.8) highConfidence++;
      else if (change.confidence >= 0.6) mediumConfidence++;
      else lowConfidence++;
    });

    return {
      total: changes.length,
      byImpact,
      byConfidence: {
        high: highConfidence,
        medium: mediumConfidence,
        low: lowConfidence,
      },
      averageConfidence: changes.length > 0 ? totalConfidence / changes.length : 0,
    };
  }
}

/**
 * 🎯 検知パターン定義
 */
interface DetectionPattern {
  /** ファイルパスパターン */
  filePatterns: RegExp[];
  /** Diff内容パターン */
  diffPatterns: RegExp[];
  /** 信頼度 */
  confidence: number;
  /** 影響度 */
  impact: ImpactLevel;
  /** 対象グループ */
  affectedGroups: AffectedGroup[];
  /** 検知理由 */
  reason: string;
}

/**
 * 🌍 グローバル検知エンジン
 */
export const breakingChangeDetector = new BreakingChangeDetector();

/**
 * 🔧 便利関数
 */
export const detectBreakingChanges = (fromCommit?: string, toCommit?: string) =>
  breakingChangeDetector.detectFromGitDiff(fromCommit, toCommit);

export const filterHighConfidenceChanges = (changes: DetectedChange[]) =>
  breakingChangeDetector.filterByConfidence(changes, 0.8);

export default BreakingChangeDetector;
