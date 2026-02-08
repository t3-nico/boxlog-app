/**
 * Dayopt Storybook カスタムテーマ
 *
 * globals.css のデザイントークンから変換したhex値を使用。
 * Storybook の create() API は CSS変数を受け付けないため、
 * 各値にトークン参照コメントを付けて同期を保つ。
 *
 * トークン変更時はこのファイルも更新すること。
 * @see src/styles/globals.css
 */
import { create } from '@storybook/theming/create';

export const dayoptLightTheme = create({
  base: 'light',
  brandTitle: 'Dayopt Design System',
  brandTarget: '_self',

  // globals.css body font-family と同一スタック
  fontBase:
    "Inter, 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontCode: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace",

  // --primary: oklch(0.45 0.188 259.8145)
  colorPrimary: '#2b4acb',
  colorSecondary: '#4a6ef5',

  // --background: oklch(0.99 0 0)
  appBg: '#fafafa',
  appContentBg: '#ffffff',
  appPreviewBg: '#fdfdfd',

  // --border: oklch(0.75 0.01 264.54)
  appBorderColor: '#b3b3b8',
  // --radius-md: 0.5rem (8px)
  appBorderRadius: 8,

  // --foreground: oklch(0.25 0 0)
  textColor: '#1a1a1a',
  // --muted-foreground: oklch(0.35 0.02 264.54)
  textMutedColor: '#52525b',

  barTextColor: '#52525b',
  barHoverColor: '#4a6ef5',
  // --primary hex近似
  barSelectedColor: '#2b4acb',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  // --border hex近似
  inputBorder: '#b3b3b8',
  // --foreground hex近似
  inputTextColor: '#1a1a1a',
  inputBorderRadius: 8,
});

export const dayoptDarkTheme = create({
  base: 'dark',
  brandTitle: 'Dayopt Design System',
  brandTarget: '_self',

  // globals.css body font-family と同一スタック
  fontBase:
    "Inter, 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontCode: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace",

  // --primary dark: oklch(0.5 0.188 259.8145)
  colorPrimary: '#4a6ef5',
  colorSecondary: '#6b8af7',

  // --background dark: oklch(0.24 0 0)
  appBg: '#313131',
  // --container dark: oklch(0.18 0 0)
  appContentBg: '#252525',
  appPreviewBg: '#1a1a1a',

  // --border dark: oklch(0.3715 0 0)
  appBorderColor: '#4f4f4f',
  appBorderRadius: 8,

  // --foreground dark: oklch(0.9219 0 0)
  textColor: '#e8e8e8',
  // --muted-foreground dark: oklch(0.78 0 0)
  textMutedColor: '#bebebe',

  barTextColor: '#bebebe',
  barHoverColor: '#6b8af7',
  barSelectedColor: '#4a6ef5',
  barBg: '#252525',

  inputBg: '#313131',
  inputBorder: '#4f4f4f',
  inputTextColor: '#e8e8e8',
  inputBorderRadius: 8,
});
