import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useHighContrast } from './useHighContrast';

describe('useHighContrast', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with false by default', () => {
    const { result } = renderHook(() => useHighContrast());
    expect(result.current.isHighContrastEnabled).toBe(false);
  });

  it('should toggle high contrast mode', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.toggleHighContrast();
    });

    expect(result.current.isHighContrastEnabled).toBe(true);

    act(() => {
      result.current.toggleHighContrast();
    });

    expect(result.current.isHighContrastEnabled).toBe(false);
  });

  it('should enable high contrast mode', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.toggleHighContrast(true);
    });

    expect(result.current.isHighContrastEnabled).toBe(true);
  });

  it('should disable high contrast mode', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.toggleHighContrast(true);
    });

    act(() => {
      result.current.toggleHighContrast(false);
    });

    expect(result.current.isHighContrastEnabled).toBe(false);
  });

  it('should persist state in localStorage', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.toggleHighContrast(true);
    });

    const stored = localStorage.getItem('accessibility-high-contrast');
    expect(stored).toBe('true');
  });

  it('should load state from localStorage on mount', () => {
    localStorage.setItem('accessibility-high-contrast', 'true');

    const { result } = renderHook(() => useHighContrast());

    expect(result.current.isHighContrastEnabled).toBe(true);
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useHighContrast());

    act(() => {
      result.current.changeTheme('blackOnWhite');
    });

    expect(result.current.currentTheme).toBe('blackOnWhite');
    expect(result.current.isHighContrastEnabled).toBe(true);
  });

  it('should get available themes', () => {
    const { result } = renderHook(() => useHighContrast());

    const themes = result.current.getAvailableThemes();
    expect(themes.length).toBeGreaterThan(0);
    expect(themes[0]).toHaveProperty('name');
    expect(themes[0]).toHaveProperty('colors');
  });
});
