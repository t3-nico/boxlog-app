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

    describe('ステータスフィルター (status:xxx)', () => {
      it('status:doneを抽出できる', () => {
        const result = parseSearchQuery('status:done');

        expect(result.filters.status).toEqual(['closed']);
        expect(result.hasFilters).toBe(true);
      });

      it('status:openを抽出できる', () => {
        const result = parseSearchQuery('status:open');

        expect(result.filters.status).toEqual(['open']);
      });

      it('後方互換: status:todoをopenにマッピング', () => {
        const result = parseSearchQuery('status:todo');

        expect(result.filters.status).toEqual(['open']);
      });

      it('後方互換: status:in_progressをopenにマッピング', () => {
        const result = parseSearchQuery('status:in_progress');

        expect(result.filters.status).toEqual(['open']);
      });

      it('後方互換: status:doingをopenにマッピング', () => {
        const result = parseSearchQuery('status:doing');

        expect(result.filters.status).toEqual(['open']);
      });

      it('大文字小文字を区別しない', () => {
        const result = parseSearchQuery('STATUS:DONE');

        expect(result.filters.status).toEqual(['closed']);
      });

      it('エイリアス: completedはdoneにマッピング', () => {
        const result = parseSearchQuery('status:completed');

        expect(result.filters.status).toEqual(['closed']);
      });

      it('エイリアス: pendingはopenにマッピング', () => {
        const result = parseSearchQuery('status:pending');

        expect(result.filters.status).toEqual(['open']);
      });

      it('複数のステータスを抽出できる', () => {
        const result = parseSearchQuery('status:open status:done');

        expect(result.filters.status).toEqual(['open', 'closed']);
      });

      it('不明なステータスは無視される', () => {
        const result = parseSearchQuery('status:unknown');

        expect(result.filters.status).toBeUndefined();
      });
    });

    describe('複合フィルター', () => {
      it('すべてのフィルタータイプを組み合わせられる', () => {
        const result = parseSearchQuery('ミーティング #仕事 status:open');

        expect(result.text).toBe('ミーティング');
        expect(result.filters.tags).toEqual(['仕事']);
        expect(result.filters.status).toEqual(['open']);
        expect(result.hasFilters).toBe(true);
      });

      it('テキストなしでフィルターのみ', () => {
        const result = parseSearchQuery('#仕事 status:done');

        expect(result.text).toBe('');
        expect(result.filters.tags).toEqual(['仕事']);
        expect(result.filters.status).toEqual(['closed']);
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

    it('ステータスフィルターのヒントが含まれる', () => {
      const hints = getFilterHints();
      const statusHint = hints.find((h) => h.syntax.includes('status:'));

      expect(statusHint).toBeDefined();
    });
  });
});
