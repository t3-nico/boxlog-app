'use client';

/**
 * ハイコントラストモード管理フック
 *
 * テーマ定義・CSS生成・ユーティリティは highContrastThemes.ts に分離。
 */

import { useCallback, useEffect, useState } from 'react';

import type { HighContrastColors } from './highContrastThemes';
import {
  HIGH_CONTRAST_THEMES,
  applyHighContrastTheme,
  calculateContrastRatio,
  detectSystemHighContrast,
  getStoredContrastTheme,
  getStoredHighContrast,
  removeHighContrastStyles,
} from './highContrastThemes';

export function useHighContrast() {
  // 遅延初期化でlocalStorageから読み込み
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(getStoredHighContrast);
  const [currentTheme, setCurrentTheme] = useState<string>(getStoredContrastTheme);
  const [isSystemHighContrast, setIsSystemHighContrast] = useState(false);

  // システムのハイコントラスト設定を監視
  useEffect(() => {
    const updateSystemHighContrast = () => {
      const systemHighContrast = detectSystemHighContrast();

      setIsSystemHighContrast(systemHighContrast);

      // システムでハイコントラストが有効な場合、自動的に適用
      if (systemHighContrast && !isHighContrastEnabled) {
        setIsHighContrastEnabled(true);

        setCurrentTheme('blackOnWhite');
      }
    };

    updateSystemHighContrast();

    // メディアクエリの変更を監視
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(-ms-high-contrast: active)'),
      window.matchMedia('(-ms-high-contrast: black-on-white)'),
      window.matchMedia('(-ms-high-contrast: white-on-black)'),
    ];

    mediaQueries.forEach((mq) => {
      mq.addEventListener('change', updateSystemHighContrast);
    });

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener('change', updateSystemHighContrast);
      });
    };
  }, [isHighContrastEnabled]);

  // テーマの適用
  useEffect(() => {
    const theme = HIGH_CONTRAST_THEMES[currentTheme];
    if (!theme || !isHighContrastEnabled) {
      removeHighContrastStyles();
      return;
    }

    applyHighContrastTheme(currentTheme);
  }, [isHighContrastEnabled, currentTheme]);

  // ハイコントラストモードの切り替え
  const toggleHighContrast = useCallback(
    (enabled?: boolean) => {
      const newEnabled = enabled !== undefined ? enabled : !isHighContrastEnabled;
      setIsHighContrastEnabled(newEnabled);
      localStorage.setItem('accessibility-high-contrast', newEnabled.toString());

      if (newEnabled && currentTheme === 'default') {
        setCurrentTheme('blackOnWhite');
      }
    },
    [isHighContrastEnabled, currentTheme],
  );

  // テーマの変更
  const changeTheme = useCallback(
    (themeName: string) => {
      if (HIGH_CONTRAST_THEMES[themeName]) {
        setCurrentTheme(themeName);
        localStorage.setItem('accessibility-contrast-theme', themeName);

        if (!isHighContrastEnabled) {
          setIsHighContrastEnabled(true);
          localStorage.setItem('accessibility-high-contrast', 'true');
        }
      }
    },
    [isHighContrastEnabled],
  );

  // 現在のテーマの情報を取得
  const getCurrentTheme = useCallback(() => {
    return HIGH_CONTRAST_THEMES[currentTheme];
  }, [currentTheme]);

  // 利用可能なテーマリストを取得
  const getAvailableThemes = useCallback(() => {
    return Object.entries(HIGH_CONTRAST_THEMES).map(([key, theme]) => ({
      key,
      ...theme,
    }));
  }, []);

  // 特定の色の組み合わせのコントラスト比を確認
  const checkContrast = useCallback((foreground: string, background: string) => {
    const ratio = calculateContrastRatio(foreground, background);
    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7.0,
    };
  }, []);

  // 現在のテーマのコントラスト比を検証
  const validateCurrentTheme = useCallback(() => {
    const theme = getCurrentTheme() ?? HIGH_CONTRAST_THEMES.default;
    if (!theme) return { compliant: false, results: {} };

    const results = {
      background_foreground: checkContrast(theme.colors.foreground, theme.colors.background),
      primary_background: checkContrast(theme.colors.primary, theme.colors.background),
      accent_background: checkContrast(theme.colors.accent, theme.colors.background),
      error_background: checkContrast(theme.colors.error, theme.colors.background),
      warning_background: checkContrast(theme.colors.warning, theme.colors.background),
      success_background: checkContrast(theme.colors.success, theme.colors.background),
    };

    const allAAA = Object.values(results).every((result) => result.wcagAAA);
    const allAA = Object.values(results).every((result) => result.wcagAA);

    return {
      results,
      wcagAAA: allAAA,
      wcagAA: allAA,
    };
  }, [getCurrentTheme, checkContrast]);

  // CSS変数を取得するヘルパー
  const getContrastVariable = useCallback((name: keyof HighContrastColors) => {
    return `var(--contrast-${name})`;
  }, []);

  // ハイコントラスト用のクラス名を生成
  const getContrastClassName = useCallback(
    (baseClass: string, contrastClass: string) => {
      return isHighContrastEnabled ? `${baseClass} ${contrastClass}` : baseClass;
    },
    [isHighContrastEnabled],
  );

  return {
    isHighContrastEnabled,
    currentTheme,
    isSystemHighContrast,
    toggleHighContrast,
    changeTheme,
    getCurrentTheme,
    getAvailableThemes,
    checkContrast,
    validateCurrentTheme,
    getContrastVariable,
    getContrastClassName,

    // 便利なプロパティ
    colors: (getCurrentTheme() || HIGH_CONTRAST_THEMES.default!).colors,
    isWcagAAA: (getCurrentTheme() || HIGH_CONTRAST_THEMES.default!).wcagAAA,
  };
}
