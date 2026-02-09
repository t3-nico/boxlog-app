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
  colorPrimary: '#004bbb',
  // --ring: oklch(0.6231 0.188 259.8145)
  colorSecondary: '#3b82f6',

  // --background: oklch(0.99 0 0)
  appBg: '#fcfcfc',
  appContentBg: '#ffffff',
  appPreviewBg: '#fcfcfc',

  // --border: oklch(0.75 0.01 264.54)
  appBorderColor: '#abaeb4',
  // --radius-md: 0.5rem (8px)
  appBorderRadius: 8,

  // --foreground: oklch(0.25 0 0)
  textColor: '#222222',
  // --muted-foreground: oklch(0.35 0.02 264.54)
  textMutedColor: '#353b45',

  barTextColor: '#353b45',
  // --ring: oklch(0.6231 0.188 259.8145)
  barHoverColor: '#3b82f6',
  // --primary: oklch(0.45 0.188 259.8145)
  barSelectedColor: '#004bbb',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  // --border: oklch(0.75 0.01 264.54)
  inputBorder: '#abaeb4',
  // --foreground: oklch(0.25 0 0)
  inputTextColor: '#222222',
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
  colorPrimary: '#115bcc',
  // --ring: oklch(0.6231 0.188 259.8145)
  colorSecondary: '#3b82f6',

  // --background dark: oklch(0.24 0 0)
  appBg: '#1f1f1f',
  // --container dark: oklch(0.18 0 0)
  appContentBg: '#121212',
  // --background dark
  appPreviewBg: '#1f1f1f',

  // --border dark: oklch(0.3715 0 0)
  appBorderColor: '#404040',
  appBorderRadius: 8,

  // --foreground dark: oklch(0.9219 0 0)
  textColor: '#e5e5e5',
  // --muted-foreground dark: oklch(0.78 0 0)
  textMutedColor: '#b7b7b7',

  barTextColor: '#b7b7b7',
  // --ring: oklch(0.6231 0.188 259.8145)
  barHoverColor: '#3b82f6',
  // --primary dark: oklch(0.5 0.188 259.8145)
  barSelectedColor: '#115bcc',
  // --container dark: oklch(0.18 0 0)
  barBg: '#121212',

  // --background dark: oklch(0.24 0 0)
  inputBg: '#1f1f1f',
  // --border dark: oklch(0.3715 0 0)
  inputBorder: '#404040',
  // --foreground dark: oklch(0.9219 0 0)
  inputTextColor: '#e5e5e5',
  inputBorderRadius: 8,
});
