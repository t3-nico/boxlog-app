import { describe, expect, it } from 'vitest';
import { findMatches } from '../highlight-text';

describe('findMatches', () => {
  it('should find a simple match', () => {
    const result = findMatches('Hello World', 'world');
    expect(result).toEqual([{ start: 6, end: 11 }]);
  });

  it('should find multiple non-overlapping matches', () => {
    const result = findMatches('abc abc abc', 'abc');
    expect(result).toEqual([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
    ]);
  });

  it('should perform case-insensitive search', () => {
    const result = findMatches('Hello HELLO hello', 'hello');
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { start: 0, end: 5 },
      { start: 6, end: 11 },
      { start: 12, end: 17 },
    ]);
  });

  it('should return empty array when no match is found', () => {
    const result = findMatches('abc', 'xyz');
    expect(result).toEqual([]);
  });

  it('should return empty array for empty query', () => {
    const result = findMatches('abc', '');
    expect(result).toEqual([]);
  });

  it('should return empty array for whitespace-only query', () => {
    const result = findMatches('abc', '  ');
    expect(result).toEqual([]);
  });

  it('should return empty array for empty text', () => {
    const result = findMatches('', 'abc');
    expect(result).toEqual([]);
  });

  it('should find overlapping matches', () => {
    const result = findMatches('aaa', 'aa');
    expect(result).toEqual([
      { start: 0, end: 2 },
      { start: 1, end: 3 },
    ]);
  });

  it('should handle query with leading/trailing whitespace', () => {
    const result = findMatches('hello world', '  hello  ');
    expect(result).toEqual([]);
  });

  it('should find match at the beginning of text', () => {
    const result = findMatches('test string', 'test');
    expect(result).toEqual([{ start: 0, end: 4 }]);
  });

  it('should find match at the end of text', () => {
    const result = findMatches('test string', 'string');
    expect(result).toEqual([{ start: 5, end: 11 }]);
  });

  it('should find single-character matches', () => {
    const result = findMatches('aaa', 'a');
    expect(result).toEqual([
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ]);
  });

  it('should find match in mixed case', () => {
    const result = findMatches('The Quick Brown Fox', 'quick');
    expect(result).toEqual([{ start: 4, end: 9 }]);
  });

  it('should handle consecutive identical matches', () => {
    const result = findMatches('aaaa', 'aa');
    expect(result).toEqual([
      { start: 0, end: 2 },
      { start: 1, end: 3 },
      { start: 2, end: 4 },
    ]);
  });

  it('should return correct positions with special characters', () => {
    const result = findMatches('hello-world-test', 'world');
    expect(result).toEqual([{ start: 6, end: 11 }]);
  });

  it('should handle query longer than text', () => {
    const result = findMatches('hi', 'hello');
    expect(result).toEqual([]);
  });

  it('should find match with numbers', () => {
    const result = findMatches('test123test456', '123');
    expect(result).toEqual([{ start: 4, end: 7 }]);
  });

  it('should find matches with tab characters', () => {
    const result = findMatches('hello\tworld', 'world');
    expect(result).toEqual([{ start: 6, end: 11 }]);
  });

  it('should find matches with newline characters', () => {
    const result = findMatches('hello\nworld', 'world');
    expect(result).toEqual([{ start: 6, end: 11 }]);
  });
});
