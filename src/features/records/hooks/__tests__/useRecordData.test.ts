import { describe, expect, it } from 'vitest';

import { matchesDurationFilter, matchesFulfillmentFilter } from '@/hooks/useRecordData';

describe('useRecordData ユーティリティ関数', () => {
  describe('matchesFulfillmentFilter', () => {
    it('all フィルターは全てマッチ', () => {
      expect(matchesFulfillmentFilter(null, 'all')).toBe(true);
      expect(matchesFulfillmentFilter(1, 'all')).toBe(true);
      expect(matchesFulfillmentFilter(5, 'all')).toBe(true);
    });

    it('unrated フィルターは null のみマッチ', () => {
      expect(matchesFulfillmentFilter(null, 'unrated')).toBe(true);
      expect(matchesFulfillmentFilter(1, 'unrated')).toBe(false);
      expect(matchesFulfillmentFilter(5, 'unrated')).toBe(false);
    });

    it('数値フィルターは一致するスコアのみマッチ', () => {
      expect(matchesFulfillmentFilter(1, '1')).toBe(true);
      expect(matchesFulfillmentFilter(2, '1')).toBe(false);
      expect(matchesFulfillmentFilter(null, '1')).toBe(false);
      expect(matchesFulfillmentFilter(5, '5')).toBe(true);
    });
  });

  describe('matchesDurationFilter', () => {
    it('all フィルターは全てマッチ', () => {
      expect(matchesDurationFilter(0, 'all')).toBe(true);
      expect(matchesDurationFilter(30, 'all')).toBe(true);
      expect(matchesDurationFilter(120, 'all')).toBe(true);
    });

    it('short フィルターは30分未満', () => {
      expect(matchesDurationFilter(0, 'short')).toBe(true);
      expect(matchesDurationFilter(15, 'short')).toBe(true);
      expect(matchesDurationFilter(29, 'short')).toBe(true);
      expect(matchesDurationFilter(30, 'short')).toBe(false);
      expect(matchesDurationFilter(60, 'short')).toBe(false);
    });

    it('medium フィルターは30分〜60分', () => {
      expect(matchesDurationFilter(29, 'medium')).toBe(false);
      expect(matchesDurationFilter(30, 'medium')).toBe(true);
      expect(matchesDurationFilter(45, 'medium')).toBe(true);
      expect(matchesDurationFilter(60, 'medium')).toBe(true);
      expect(matchesDurationFilter(61, 'medium')).toBe(false);
    });

    it('long フィルターは60分超', () => {
      expect(matchesDurationFilter(60, 'long')).toBe(false);
      expect(matchesDurationFilter(61, 'long')).toBe(true);
      expect(matchesDurationFilter(120, 'long')).toBe(true);
      expect(matchesDurationFilter(480, 'long')).toBe(true);
    });
  });
});
