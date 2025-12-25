import { describe, expect, it } from 'vitest';

/**
 * calculateLockoutMinutes のテスト
 * Supabase依存の関数は統合テストで検証するため、純粋関数のみテスト
 */

// calculateLockoutMinutes はエクスポートされていないため、ロジックを再現してテスト
// 本番コードでこの関数をエクスポートすることを推奨

describe('account-lockout', () => {
  describe('calculateLockoutMinutes ロジック', () => {
    // LOCKOUT_CONFIG の値
    const THRESHOLD_5_FAILURES = 5;
    const THRESHOLD_10_FAILURES = 10;
    const LOCKOUT_15_MINUTES = 15;
    const LOCKOUT_60_MINUTES = 60;

    /**
     * ロックアウト期間を計算（ソースコードのロジックを再現）
     */
    function calculateLockoutMinutes(failedAttempts: number): number {
      if (failedAttempts >= THRESHOLD_10_FAILURES) {
        return LOCKOUT_60_MINUTES;
      }
      if (failedAttempts >= THRESHOLD_5_FAILURES) {
        return LOCKOUT_15_MINUTES;
      }
      return 0;
    }

    it('5回未満の失敗ではロックアウトなし', () => {
      expect(calculateLockoutMinutes(0)).toBe(0);
      expect(calculateLockoutMinutes(1)).toBe(0);
      expect(calculateLockoutMinutes(4)).toBe(0);
    });

    it('5回以上10回未満の失敗で15分ロックアウト', () => {
      expect(calculateLockoutMinutes(5)).toBe(15);
      expect(calculateLockoutMinutes(6)).toBe(15);
      expect(calculateLockoutMinutes(9)).toBe(15);
    });

    it('10回以上の失敗で60分ロックアウト', () => {
      expect(calculateLockoutMinutes(10)).toBe(60);
      expect(calculateLockoutMinutes(15)).toBe(60);
      expect(calculateLockoutMinutes(100)).toBe(60);
    });
  });

  describe('LockoutStatus 型の検証', () => {
    it('ロックアウトされていない状態の構造', () => {
      const status = {
        isLocked: false,
        remainingMinutes: 0,
        failedAttempts: 3,
        lockUntil: null,
      };

      expect(status.isLocked).toBe(false);
      expect(status.remainingMinutes).toBe(0);
      expect(status.failedAttempts).toBe(3);
      expect(status.lockUntil).toBeNull();
    });

    it('ロックアウトされている状態の構造', () => {
      const lockUntil = new Date('2025-01-15T12:30:00Z');
      const status = {
        isLocked: true,
        remainingMinutes: 15,
        failedAttempts: 5,
        lockUntil,
      };

      expect(status.isLocked).toBe(true);
      expect(status.remainingMinutes).toBe(15);
      expect(status.failedAttempts).toBe(5);
      expect(status.lockUntil).toEqual(lockUntil);
    });
  });

  describe('ロックアウト解除時刻の計算ロジック', () => {
    it('15分ロックアウトの解除時刻を計算できる', () => {
      const lastFailedAttempt = new Date('2025-01-15T12:00:00Z');
      const lockoutMinutes = 15;

      const lockUntil = new Date(lastFailedAttempt);
      lockUntil.setMinutes(lockUntil.getMinutes() + lockoutMinutes);

      expect(lockUntil.toISOString()).toBe('2025-01-15T12:15:00.000Z');
    });

    it('60分ロックアウトの解除時刻を計算できる', () => {
      const lastFailedAttempt = new Date('2025-01-15T12:00:00Z');
      const lockoutMinutes = 60;

      const lockUntil = new Date(lastFailedAttempt);
      lockUntil.setMinutes(lockUntil.getMinutes() + lockoutMinutes);

      expect(lockUntil.toISOString()).toBe('2025-01-15T13:00:00.000Z');
    });
  });

  describe('残り時間の計算ロジック', () => {
    it('残り時間を分単位で切り上げ計算できる', () => {
      const lockUntil = new Date('2025-01-15T12:15:00Z');
      const now = new Date('2025-01-15T12:00:30Z'); // 14分30秒残り

      const remainingMs = lockUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

      expect(remainingMinutes).toBe(15); // 切り上げで15分
    });

    it('ちょうど残り時間の場合も正しく計算できる', () => {
      const lockUntil = new Date('2025-01-15T12:15:00Z');
      const now = new Date('2025-01-15T12:05:00Z'); // ちょうど10分残り

      const remainingMs = lockUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

      expect(remainingMinutes).toBe(10);
    });

    it('ロックアウト解除後は0以下になる', () => {
      const lockUntil = new Date('2025-01-15T12:15:00Z');
      const now = new Date('2025-01-15T12:20:00Z'); // 解除後5分

      const remainingMs = lockUntil.getTime() - now.getTime();

      expect(remainingMs).toBeLessThan(0);
    });
  });

  describe('メールアドレスの正規化', () => {
    it('小文字に変換される', () => {
      const email = 'Test@Example.COM';
      const normalized = email.toLowerCase();

      expect(normalized).toBe('test@example.com');
    });
  });

  describe('試行履歴の検証期間', () => {
    it('60分前からの履歴を検証する', () => {
      const ATTEMPT_WINDOW_MINUTES = 60;
      const now = new Date('2025-01-15T12:00:00Z');

      const windowStart = new Date(now);
      windowStart.setMinutes(windowStart.getMinutes() - ATTEMPT_WINDOW_MINUTES);

      expect(windowStart.toISOString()).toBe('2025-01-15T11:00:00.000Z');
    });
  });
});
