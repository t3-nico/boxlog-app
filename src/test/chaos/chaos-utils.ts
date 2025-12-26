/**
 * カオスエンジニアリング ユーティリティ
 *
 * フロントエンドの障害耐性をテストするためのツール
 * 開発環境でのみ使用
 */

type ChaosScenario = 'network-failure' | 'api-latency' | 'storage-corruption' | 'auth-failure';

interface ChaosConfig {
  enabled: boolean;
  scenarios: Partial<Record<ChaosScenario, boolean>>;
  latencyMs: number;
  failureRate: number; // 0-1
}

const defaultConfig: ChaosConfig = {
  enabled: false,
  scenarios: {},
  latencyMs: 3000,
  failureRate: 0.5,
};

let currentConfig: ChaosConfig = { ...defaultConfig };

/**
 * カオスモードを有効化
 */
export function enableChaos(scenarios: ChaosScenario[], options?: Partial<ChaosConfig>): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Chaos mode is disabled in production');
    return;
  }

  currentConfig = {
    ...defaultConfig,
    ...options,
    enabled: true,
    scenarios: scenarios.reduce(
      (acc, s) => ({ ...acc, [s]: true }),
      {} as Record<ChaosScenario, boolean>,
    ),
  };

  console.log('[Chaos] Enabled with scenarios:', scenarios);
}

/**
 * カオスモードを無効化
 */
export function disableChaos(): void {
  currentConfig = { ...defaultConfig };
  console.log('[Chaos] Disabled');
}

/**
 * 現在のカオス設定を取得
 */
export function getChaosConfig(): ChaosConfig {
  return { ...currentConfig };
}

/**
 * シナリオが有効かチェック
 */
export function isScenarioEnabled(scenario: ChaosScenario): boolean {
  return currentConfig.enabled && currentConfig.scenarios[scenario] === true;
}

/**
 * ランダムに失敗するかどうかを判定
 */
export function shouldFail(): boolean {
  return Math.random() < currentConfig.failureRate;
}

/**
 * ネットワーク障害をシミュレート
 * fetchをラップして使用
 */
export async function chaosWrappedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (isScenarioEnabled('network-failure') && shouldFail()) {
    console.log('[Chaos] Network failure simulated');
    throw new TypeError('Failed to fetch (chaos simulated)');
  }

  if (isScenarioEnabled('api-latency')) {
    console.log(`[Chaos] Adding ${currentConfig.latencyMs}ms latency`);
    await new Promise((resolve) => setTimeout(resolve, currentConfig.latencyMs));
  }

  if (isScenarioEnabled('auth-failure') && shouldFail()) {
    console.log('[Chaos] Auth failure simulated');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return fetch(input, init);
}

/**
 * ローカルストレージの破損をシミュレート
 */
export function corruptLocalStorage(key: string): void {
  if (!isScenarioEnabled('storage-corruption')) return;

  console.log(`[Chaos] Corrupting localStorage key: ${key}`);
  localStorage.setItem(key, '{"corrupted":true,"__chaos__":1}');
}

/**
 * ランダムなローカルストレージキーを削除
 */
export function randomlyDeleteStorageKeys(probability = 0.3): void {
  if (!isScenarioEnabled('storage-corruption')) return;

  const keysToDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && Math.random() < probability) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    console.log(`[Chaos] Deleting localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
}

/**
 * 開発ツール用: コンソールからカオスモードを制御
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__chaos__ = {
    enable: enableChaos,
    disable: disableChaos,
    config: getChaosConfig,
    scenarios: ['network-failure', 'api-latency', 'storage-corruption', 'auth-failure'],
  };

  console.log(
    '[Chaos] Dev tools available. Use window.__chaos__.enable(["network-failure"]) to start.',
  );
}
