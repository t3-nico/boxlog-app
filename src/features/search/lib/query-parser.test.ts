import { describe, expect, it } from 'vitest';

import { getFilterHints, parseSearchQuery } from './query-parser';

describe('query-parser', () => {
  describe('parseSearchQuery', () => {
    describe('プレーンテキスト', () => {
      it('フィルターなしのテキストはそのまま返す', () => {
        const result = parseSearchQuery('ミーティング準備');

        expect(result.text).toBe('ミーティング準備');
        expect(result.hasFilters).toBe(false);
        expect(result.filters).toEqual({});
      });

      it('空文字列を処理できる', () => {
        const result = parseSearchQuery('');

        expect(result.text).toBe('');
        expect(result.hasFilters).toBe(false);
      });

      it('スペースのみの文字列を処理できる', () => {
        const result = parseSearchQuery('   ');

        expect(result.text).toBe('');
        expect(result.hasFilters).toBe(false);
      });
    });

    describe('タグフィルター (#tagname)', () => {
      it('単一のタグを抽出できる', () => {
        const result = parseSearchQuery('#仕事');

        expect(result.filters.tags).toEqual(['仕事']);
        expect(result.text).toBe('');
        expect(result.hasFilters).toBe(true);
      });

      it('複数のタグを抽出できる', () => {
        const result = parseSearchQuery('#仕事 #重要');

        expect(result.filters.tags).toEqual(['仕事', '重要']);
        expect(result.hasFilters).toBe(true);
      });

      it('タグとテキストを分離できる', () => {
        const result = parseSearchQuery('ミーティング #仕事 準備');

        expect(result.filters.tags).toEqual(['仕事']);
        expect(result.text).toBe('ミーティング  準備');
        expect(result.hasFilters).toBe(true);
      });

      it('英語のタグも抽出できる', () => {
        const result = parseSearchQuery('#project-a');

        expect(result.filters.tags).toEqual(['project-a']);
      });
    });

    describe('複合フィルター', () => {
      it('タグとテキストを組み合わせられる', () => {
        const result = parseSearchQuery('ミーティング #仕事');

        expect(result.text).toBe('ミーティング');
        expect(result.filters.tags).toEqual(['仕事']);
        expect(result.hasFilters).toBe(true);
      });

      it('テキストなしでタグフィルターのみ', () => {
        const result = parseSearchQuery('#仕事');

        expect(result.text).toBe('');
        expect(result.filters.tags).toEqual(['仕事']);
      });
    });
  });

  describe('getFilterHints', () => {
    it('フィルターヒントの配列を返す', () => {
      const hints = getFilterHints();

      expect(Array.isArray(hints)).toBe(true);
      expect(hints.length).toBeGreaterThan(0);
    });

    it('各ヒントにsyntaxとdescriptionがある', () => {
      const hints = getFilterHints();

      hints.forEach((hint) => {
        expect(hint).toHaveProperty('syntax');
        expect(hint).toHaveProperty('description');
        expect(typeof hint.syntax).toBe('string');
        expect(typeof hint.description).toBe('string');
      });
    });

    it('タグフィルターのヒントが含まれる', () => {
      const hints = getFilterHints();
      const tagHint = hints.find((h) => h.syntax.includes('#'));

      expect(tagHint).toBeDefined();
    });
  });
});
