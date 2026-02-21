import { describe, expect, it } from 'vitest';

import { analyzeInvalidChars, hasInvalidUnicodeChars, safeJsonStringify } from './json-utils';

describe('json-utils', () => {
  describe('safeJsonStringify', () => {
    it('通常のオブジェクトをJSON化', () => {
      const result = safeJsonStringify({ name: 'テスト', count: 42 });
      expect(JSON.parse(result)).toEqual({ name: 'テスト', count: 42 });
    });

    it('制御文字を除去してJSON化', () => {
      const result = safeJsonStringify({ text: 'hello\x00world' });
      const parsed = JSON.parse(result);
      expect(parsed.text).not.toContain('\x00');
    });

    it('配列をJSON化', () => {
      const result = safeJsonStringify(['a', 'b', 'c']);
      expect(JSON.parse(result)).toEqual(['a', 'b', 'c']);
    });

    it('ネストされたオブジェクトを処理', () => {
      const result = safeJsonStringify({ nested: { value: 'ok' } });
      expect(JSON.parse(result)).toEqual({ nested: { value: 'ok' } });
    });

    it('null, number, booleanを処理', () => {
      expect(safeJsonStringify(null)).toBe('null');
      expect(safeJsonStringify(42)).toBe('42');
      expect(safeJsonStringify(true)).toBe('true');
    });

    it('spaceオプションでインデント', () => {
      const result = safeJsonStringify({ a: 1 }, 2);
      expect(result).toContain('\n');
    });
  });

  describe('hasInvalidUnicodeChars', () => {
    it('正常な文字列はfalse', () => {
      expect(hasInvalidUnicodeChars('Hello こんにちは')).toBe(false);
    });

    it('制御文字を検出', () => {
      expect(hasInvalidUnicodeChars('hello\x00')).toBe(true);
      expect(hasInvalidUnicodeChars('hello\x08')).toBe(true);
    });

    it('非文字コードポイントを検出', () => {
      expect(hasInvalidUnicodeChars('hello\uFFFE')).toBe(true);
    });

    it('タブ・改行は正常', () => {
      expect(hasInvalidUnicodeChars('hello\tworld\n')).toBe(false);
    });
  });

  describe('analyzeInvalidChars', () => {
    it('正常な文字列はissuesなし', () => {
      const result = analyzeInvalidChars('Hello');
      expect(result.hasIssues).toBe(false);
      expect(result.issues).toEqual([]);
    });

    it('制御文字の位置とコードを検出', () => {
      const result = analyzeInvalidChars('ab\x00cd');
      expect(result.hasIssues).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]!.type).toBe('control_character');
      expect(result.issues[0]!.position).toBe(2);
      expect(result.issues[0]!.charCode).toBe(0);
    });
  });
});
