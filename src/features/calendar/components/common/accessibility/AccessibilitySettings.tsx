'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { FocusTrap } from '../../../hooks/useFocusTrap'
import { useHighContrast } from '../../../hooks/useHighContrast'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

// ヘッダーコンポーネント
const AccessibilityHeader = ({
  onClose,
  getContrastClassName,
}: {
  onClose: () => void
  getContrastClassName: (defaultClass: string, contrastClass: string) => string
}) => (
  <div
    className={cn(
      'flex items-center justify-between border-b p-6',
      getContrastClassName('border-border', 'contrast-border')
    )}
  >
    <div>
      <h2
        id="accessibility-settings-title"
        className={cn('text-2xl font-bold text-gray-900', getContrastClassName('text-gray-900', 'contrast-text'))}
      >
        アクセシビリティ設定
      </h2>
      <p
        id="accessibility-settings-description"
        className={cn('mt-1 text-sm text-gray-600', getContrastClassName('text-gray-600', 'contrast-text'))}
      >
        視覚的・操作的なアクセシビリティを調整できます
      </p>
    </div>

    <button
      type="button"
      onClick={onClose}
      className={cn(
        'text-muted-foreground hover:text-foreground hover:bg-foreground/8 rounded-md p-2',
        'focus:ring-ring focus:ring-2 focus:outline-none',
        getContrastClassName(
          'text-muted-foreground hover:bg-foreground/8 hover:text-foreground',
          'contrast-text hover:contrast-selected focus:contrast-focus'
        )
      )}
      aria-label="設定を閉じる"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
)

// ハイコントラスト設定コンポーネント
const HighContrastSection = ({
  isHighContrastEnabled,
  isSystemHighContrast,
  handleToggleHighContrast,
  getContrastClassName,
}: {
  isHighContrastEnabled: boolean
  isSystemHighContrast: boolean
  handleToggleHighContrast: () => void
  getContrastClassName: (defaultClass: string, contrastClass: string) => string
}) => (
  <section>
    <h3
      className={cn('mb-4 text-lg font-semibold text-gray-900', getContrastClassName('text-gray-900', 'contrast-text'))}
    >
      ハイコントラストモード
    </h3>

    {/* システム設定の表示 */}
    {isSystemHighContrast === true && (
      <div
        className={cn(
          'mb-4 rounded-md border border-blue-200 bg-blue-50 p-3',
          getContrastClassName('border-blue-200 bg-blue-50', 'contrast-selected contrast-border')
        )}
      >
        <p className={cn('text-sm text-blue-800', getContrastClassName('text-blue-800', 'contrast-text'))}>
          <span className="font-medium">システム設定：</span>
          OSでハイコントラストモードが有効になっています
        </p>
      </div>
    )}

    {/* ハイコントラスト有効/無効切り替え */}
    <div className="mb-4 flex items-center justify-between">
      <label
        htmlFor="high-contrast-toggle"
        className={cn('text-sm font-medium text-gray-700', getContrastClassName('text-gray-700', 'contrast-text'))}
      >
        ハイコントラストモードを有効にする
      </label>

      <button
        id="high-contrast-toggle"
        type="button"
        role="switch"
        aria-checked={isHighContrastEnabled}
        onClick={handleToggleHighContrast}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
          isHighContrastEnabled ? 'bg-blue-600' : 'bg-gray-200',
          getContrastClassName(isHighContrastEnabled ? 'bg-blue-600' : 'bg-gray-200', 'contrast-selected')
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            isHighContrastEnabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  </section>
)

export const AccessibilitySettings = ({ isOpen, onClose, className }: AccessibilitySettingsProps) => {
  const {
    isHighContrastEnabled,
    currentTheme,
    isSystemHighContrast,
    toggleHighContrast,
    changeTheme,
    getAvailableThemes,
    validateCurrentTheme,
    getContrastClassName,
  } = useHighContrast()

  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const availableThemes = getAvailableThemes()
  const themeValidation = validateCurrentTheme()

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName)
    changeTheme(themeName)
  }

  const handleToggleHighContrast = () => {
    toggleHighContrast()
  }

  if (!isOpen) return null

  return (
    <FocusTrap
      enabled={isOpen}
      onDeactivate={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        className={cn(
          'mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl',
          getContrastClassName('bg-white', 'contrast-bg contrast-border border-2'),
          className
        )}
        role="dialog"
        aria-labelledby="accessibility-settings-title"
        aria-describedby="accessibility-settings-description"
      >
        <AccessibilityHeader onClose={onClose} getContrastClassName={getContrastClassName} />

        {/* コンテンツ */}
        <div className="space-y-8 p-6">
          <HighContrastSection
            isHighContrastEnabled={isHighContrastEnabled}
            isSystemHighContrast={isSystemHighContrast}
            handleToggleHighContrast={handleToggleHighContrast}
            getContrastClassName={getContrastClassName}
          />

          {/* テーマ選択 */}
          {isHighContrastEnabled === true && (
            <div className="space-y-3">
              <h4
                className={cn(
                  'text-md font-medium text-gray-800',
                  getContrastClassName('text-gray-800', 'contrast-text')
                )}
              >
                コントラストテーマ
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {availableThemes.map((theme) => (
                  <label
                    key={theme.key}
                    className={cn(
                      'relative flex cursor-pointer items-center rounded-lg border p-4',
                      'focus-within:ring-ring hover:bg-foreground/8 focus-within:ring-2',
                      selectedTheme === theme.key
                        ? getContrastClassName(
                            'border-blue-500 bg-blue-50',
                            'contrast-selected contrast-border border-2'
                          )
                        : getContrastClassName('border-border', 'contrast-border'),
                      getContrastClassName('hover:bg-foreground/8', 'hover:contrast-selected')
                    )}
                  >
                    <input
                      type="radio"
                      name="contrast-theme"
                      value={theme.key}
                      checked={selectedTheme === theme.key}
                      onChange={() => handleThemeChange(theme.key)}
                      className={cn(
                        'border-border text-primary focus:ring-primary h-4 w-4',
                        getContrastClassName('', 'contrast-accent')
                      )}
                    />

                    <div className="ml-3 flex-1">
                      <div
                        className={cn(
                          'text-sm font-medium text-gray-900',
                          getContrastClassName('text-gray-900', 'contrast-text')
                        )}
                      >
                        {theme.name}
                        {theme.wcagAAA != null && (
                          <span
                            className={cn(
                              'ml-2 inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800',
                              getContrastClassName('bg-green-100 text-green-800', 'contrast-success')
                            )}
                          >
                            WCAG AAA
                          </span>
                        )}
                      </div>

                      {/* テーマプレビュー */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: theme.colors.background }}
                          aria-label={`背景色: ${theme.colors.background}`}
                        />
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: theme.colors.foreground }}
                          aria-label={`文字色: ${theme.colors.foreground}`}
                        />
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: theme.colors.accent }}
                          aria-label={`アクセント色: ${theme.colors.accent}`}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* コントラスト比の検証結果 */}
          {isHighContrastEnabled === true && (
            <section>
              <h3
                className={cn(
                  'mb-4 text-lg font-semibold text-gray-900',
                  getContrastClassName('text-gray-900', 'contrast-text')
                )}
              >
                WCAG準拠状況
              </h3>

              <div
                className={cn(
                  'rounded-lg border p-4',
                  themeValidation.wcagAAA
                    ? getContrastClassName('border-green-200 bg-green-50', 'contrast-success')
                    : themeValidation.wcagAA
                      ? getContrastClassName('border-yellow-200 bg-yellow-50', 'contrast-warning')
                      : getContrastClassName('border-red-200 bg-red-50', 'contrast-error')
                )}
              >
                <div className="mb-2 flex items-center">
                  {themeValidation.wcagAAA ? (
                    <svg className="mr-2 h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : themeValidation.wcagAA ? (
                    <svg className="mr-2 h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="mr-2 h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  <span
                    className={cn(
                      'font-medium',
                      themeValidation.wcagAAA
                        ? getContrastClassName('text-green-800', 'contrast-success')
                        : themeValidation.wcagAA
                          ? getContrastClassName('text-yellow-800', 'contrast-warning')
                          : getContrastClassName('text-red-800', 'contrast-error')
                    )}
                  >
                    {themeValidation.wcagAAA ? 'WCAG AAA準拠' : themeValidation.wcagAA ? 'WCAG AA準拠' : 'WCAG基準未満'}
                  </span>
                </div>

                <p className={cn('text-sm', getContrastClassName('text-gray-700', 'contrast-text'))}>
                  {themeValidation.wcagAAA
                    ? 'このテーマは最高レベルのアクセシビリティ基準を満たしています。'
                    : themeValidation.wcagAA
                      ? 'このテーマは標準的なアクセシビリティ基準を満たしています。'
                      : 'このテーマは推奨されるアクセシビリティ基準を満たしていません。'}
                </p>
              </div>
            </section>
          )}

          {/* キーボード操作ガイド */}
          <section>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold text-gray-900',
                getContrastClassName('text-gray-900', 'contrast-text')
              )}
            >
              キーボード操作ガイド
            </h3>

            <div
              className={cn('grid grid-cols-1 gap-4 text-sm md:grid-cols-2', getContrastClassName('', 'contrast-text'))}
            >
              <div>
                <h4 className="mb-2 font-medium">基本操作</h4>
                <ul className="space-y-1">
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Tab</kbd> フォーカス移動
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Enter</kbd> 選択/実行
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Esc</kbd> キャンセル
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Space</kbd> 詳細情報
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-medium">カレンダー操作</h4>
                <ul className="space-y-1">
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">↑↓←→</kbd> 日付・時間移動
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Delete</kbd> イベント削除
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">F1</kbd> ヘルプ表示
                  </li>
                  <li>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">Home/End</kbd> 時間端移動
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* フッター */}
        <div
          className={cn(
            'border-t bg-gray-50 px-6 py-4',
            getContrastClassName('border-border bg-muted', 'contrast-border contrast-bg')
          )}
        >
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'border-border bg-background text-foreground rounded-md border px-4 py-2 text-sm font-medium',
                'hover:bg-foreground/8 focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                getContrastClassName(
                  'border-border bg-background text-foreground hover:bg-muted',
                  'contrast-text contrast-bg contrast-border hover:contrast-selected focus:contrast-focus'
                )
              )}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  )
}
