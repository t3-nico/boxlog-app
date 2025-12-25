/**
 * WCAG AA準拠のアクセシビリティユーティリティ
 */

// カラーコントラスト比の計算
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // HEX色をRGBに変換
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // 相対輝度を計算
    const getRGB = (value: number): number => {
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
  };

  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// WCAG AAコントラスト要件チェック
export function checkContrastCompliance(
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false,
): {
  ratio: number;
  isCompliant: boolean;
  level: 'AA' | 'AAA' | 'fail';
} {
  const ratio = calculateContrastRatio(foreground, background);

  // 大きなテキスト（18pt以上または14pt太字以上）の基準
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

  // WCAG基準
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  let level: 'AA' | 'AAA' | 'fail';
  if (ratio >= aaaThreshold) {
    level = 'AAA';
  } else if (ratio >= aaThreshold) {
    level = 'AA';
  } else {
    level = 'fail';
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    isCompliant: ratio >= aaThreshold,
    level,
  };
}

// フォーカス管理
export class FocusManager {
  private static trapStack: HTMLElement[] = [];

  static trapFocus(element: HTMLElement) {
    this.trapStack.push(element);
    this.setFocusTrap(element);
  }

  static releaseFocus() {
    this.trapStack.pop();
    const current = this.trapStack[this.trapStack.length - 1];
    if (current) {
      this.setFocusTrap(current);
    }
  }

  private static setFocusTrap(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // 最初の要素にフォーカス
    firstElement?.focus();
  }
}

// スクリーンリーダー対応
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
) {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-9999px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';

  document.body.appendChild(announcer);
  announcer.textContent = message;

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// キーボードナビゲーション
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'vertical',
): number {
  const { key } = event;
  let newIndex = currentIndex;

  if (orientation === 'vertical') {
    if (key === 'ArrowDown' || key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % items.length;
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + items.length) % items.length;
    }
  } else {
    if (key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % items.length;
    } else if (key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + items.length) % items.length;
    }
  }

  if (newIndex !== currentIndex) {
    event.preventDefault();
    items[newIndex]!.focus();
    return newIndex;
  }

  return currentIndex;
}

// 言語対応のアクセシビリティラベル
export function getAccessibilityLabels(locale: string) {
  const labels = {
    en: {
      close: 'Close',
      menu: 'Menu',
      search: 'Search',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      previous: 'Previous',
      next: 'Next',
      skip: 'Skip to main content',
      languageSwitch: 'Switch language',
      darkMode: 'Toggle dark mode',
    },
    ja: {
      close: '閉じる',
      menu: 'メニュー',
      search: '検索',
      loading: '読み込み中',
      error: 'エラー',
      success: '成功',
      previous: '前へ',
      next: '次へ',
      skip: 'メインコンテンツへスキップ',
      languageSwitch: '言語を切り替え',
      darkMode: 'ダークモード切り替え',
    },
  };

  return labels[locale as keyof typeof labels] || labels.en;
}

// アクセシビリティテスト用のユーティリティ
export function testAccessibility() {
  const results: Array<{
    type: string;
    severity: 'error' | 'warning';
    message: string;
    element?: HTMLElement;
  }> = [];

  // 画像のalt属性チェック
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt')) {
      results.push({
        type: 'image-alt',
        severity: 'error',
        message: 'Image missing alt attribute',
        element: img,
      });
    }
  });

  // フォーム要素のラベルチェック
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (!id || (!document.querySelector(`label[for="${id}"]`) && !ariaLabel && !ariaLabelledBy)) {
      results.push({
        type: 'form-label',
        severity: 'error',
        message: 'Form element missing label',
        element: input as HTMLElement,
      });
    }
  });

  // 見出しの階層チェック
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    if (level > lastLevel + 1) {
      results.push({
        type: 'heading-hierarchy',
        severity: 'warning',
        message: `Heading level ${level} follows h${lastLevel}, skipping levels`,
        element: heading as HTMLElement,
      });
    }
    lastLevel = level;
  });

  return results;
}

// パフォーマンス監視（アクセシビリティに影響）
export function monitorPerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Cumulative Layout Shift (CLS) - アクセシビリティに重要
        // LayoutShift エントリには hadRecentInput と value プロパティが存在
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (entry.entryType === 'layout-shift' && !layoutShiftEntry.hadRecentInput) {
          const cls = layoutShiftEntry.value ?? 0;
          if (cls > 0.1) {
            console.warn('High Cumulative Layout Shift detected:', cls);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift not supported
    }
  }
}
