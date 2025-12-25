'use client';

import { useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useHighContrast } from '../../../hooks/useHighContrast';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// ヘッダーコンポーネント
const AccessibilityHeader = ({
  onClose,
  getContrastClassName,
}: {
  onClose: () => void;
  getContrastClassName: (defaultClass: string, contrastClass: string) => string;
}) => (
  <div
    className={cn(
      'flex items-center justify-between border-b p-6',
      getContrastClassName('border-border', 'contrast-border'),
    )}
  >
    <div>
      <Dialog.Title
        className={cn(
          'text-foreground text-2xl font-bold',
          getContrastClassName('text-foreground', 'contrast-text'),
        )}
      >
        アクセシビリティ設定
      </Dialog.Title>
      <Dialog.Description
        className={cn(
          'text-muted-foreground mt-1 text-sm',
          getContrastClassName('text-muted-foreground', 'contrast-text'),
        )}
      >
        視覚的・操作的なアクセシビリティを調整できます
      </Dialog.Description>
    </div>

    <Dialog.Close asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={cn(
          'text-muted-foreground hover:text-foreground hover:bg-state-hover rounded-md',
          getContrastClassName(
            'text-muted-foreground hover:bg-state-hover hover:text-foreground',
            'contrast-text hover:contrast-selected focus:contrast-focus',
          ),
        )}
        aria-label="設定を閉じる"
      >
        <X className="h-6 w-6" />
      </Button>
    </Dialog.Close>
  </div>
);

// ハイコントラスト設定コンポーネント
const HighContrastSection = ({
  isHighContrastEnabled,
  isSystemHighContrast,
  handleToggleHighContrast,
  getContrastClassName,
}: {
  isHighContrastEnabled: boolean;
  isSystemHighContrast: boolean;
  handleToggleHighContrast: () => void;
  getContrastClassName: (defaultClass: string, contrastClass: string) => string;
}) => (
  <section>
    <h3
      className={cn(
        'text-foreground mb-4 text-lg font-semibold',
        getContrastClassName('text-foreground', 'contrast-text'),
      )}
    >
      ハイコントラストモード
    </h3>

    {/* システム設定の表示 */}
    {isSystemHighContrast === true && (
      <div
        className={cn(
          'border-primary/20 bg-primary/10 mb-4 rounded-md border p-3',
          getContrastClassName(
            'border-primary/20 bg-primary/10',
            'contrast-selected contrast-border',
          ),
        )}
      >
        <p
          className={cn(
            'text-primary text-sm',
            getContrastClassName('text-primary', 'contrast-text'),
          )}
        >
          <span className="font-medium">システム設定：</span>
          OSでハイコントラストモードが有効になっています
        </p>
      </div>
    )}

    {/* ハイコントラスト有効/無効切り替え */}
    <div className="mb-4 flex items-center justify-between">
      <label
        htmlFor="high-contrast-toggle"
        className={cn(
          'text-foreground text-sm font-medium',
          getContrastClassName('text-foreground', 'contrast-text'),
        )}
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
          'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
          isHighContrastEnabled ? 'bg-primary' : 'bg-muted',
          getContrastClassName(
            isHighContrastEnabled ? 'bg-primary' : 'bg-muted',
            'contrast-selected',
          ),
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            isHighContrastEnabled ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  </section>
);

export const AccessibilitySettings = ({
  isOpen,
  onClose,
  className,
}: AccessibilitySettingsProps) => {
  const {
    isHighContrastEnabled,
    currentTheme,
    isSystemHighContrast,
    toggleHighContrast,
    changeTheme,
    getAvailableThemes,
    validateCurrentTheme,
    getContrastClassName,
  } = useHighContrast();

  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const availableThemes = getAvailableThemes();
  const themeValidation = validateCurrentTheme();

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    changeTheme(themeName);
  };

  const handleToggleHighContrast = () => {
    toggleHighContrast();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
        <Dialog.Content
          className={cn(
            'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            getContrastClassName('bg-white', 'contrast-bg contrast-border border-2'),
            className,
          )}
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
                    'text-md text-foreground font-medium',
                    getContrastClassName('text-foreground', 'contrast-text'),
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
                        'focus-within:ring-ring hover:bg-state-hover focus-within:ring-2',
                        selectedTheme === theme.key
                          ? getContrastClassName(
                              'border-primary bg-primary/10',
                              'contrast-selected contrast-border border-2',
                            )
                          : getContrastClassName('border-border', 'contrast-border'),
                        getContrastClassName('hover:bg-state-hover', 'hover:contrast-selected'),
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
                          getContrastClassName('', 'contrast-accent'),
                        )}
                      />

                      <div className="ml-3 flex-1">
                        <div
                          className={cn(
                            'text-foreground text-sm font-medium',
                            getContrastClassName('text-foreground', 'contrast-text'),
                          )}
                        >
                          {theme.name}
                          {theme.wcagAAA != null && (
                            <span
                              className={cn(
                                'bg-success/10 text-success ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                                getContrastClassName(
                                  'bg-success/10 text-success',
                                  'contrast-success',
                                ),
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
                    'text-foreground mb-4 text-lg font-semibold',
                    getContrastClassName('text-foreground', 'contrast-text'),
                  )}
                >
                  WCAG準拠状況
                </h3>

                <div
                  className={cn(
                    'rounded-lg border p-4',
                    themeValidation.wcagAAA
                      ? getContrastClassName('border-success/20 bg-success/10', 'contrast-success')
                      : themeValidation.wcagAA
                        ? getContrastClassName(
                            'border-warning/20 bg-warning/10',
                            'contrast-warning',
                          )
                        : getContrastClassName(
                            'border-destructive/20 bg-destructive/10',
                            'contrast-error',
                          ),
                  )}
                >
                  <div className="mb-2 flex items-center">
                    {themeValidation.wcagAAA ? (
                      <svg
                        className="text-success mr-2 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : themeValidation.wcagAA ? (
                      <svg
                        className="text-warning mr-2 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="text-destructive mr-2 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
                          ? getContrastClassName('text-success', 'contrast-success')
                          : themeValidation.wcagAA
                            ? getContrastClassName('text-warning', 'contrast-warning')
                            : getContrastClassName('text-destructive', 'contrast-error'),
                      )}
                    >
                      {themeValidation.wcagAAA
                        ? 'WCAG AAA準拠'
                        : themeValidation.wcagAA
                          ? 'WCAG AA準拠'
                          : 'WCAG基準未満'}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-sm',
                      getContrastClassName('text-foreground', 'contrast-text'),
                    )}
                  >
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
                  'text-foreground mb-4 text-lg font-semibold',
                  getContrastClassName('text-foreground', 'contrast-text'),
                )}
              >
                キーボード操作ガイド
              </h3>

              <div
                className={cn(
                  'grid grid-cols-1 gap-4 text-sm md:grid-cols-2',
                  getContrastClassName('', 'contrast-text'),
                )}
              >
                <div>
                  <h4 className="mb-2 font-medium">基本操作</h4>
                  <ul className="space-y-1">
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Tab</kbd>{' '}
                      フォーカス移動
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Enter</kbd>{' '}
                      選択/実行
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Esc</kbd>{' '}
                      キャンセル
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Space</kbd>{' '}
                      詳細情報
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">カレンダー操作</h4>
                  <ul className="space-y-1">
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">↑↓←→</kbd>{' '}
                      日付・時間移動
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Delete</kbd>{' '}
                      イベント削除
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">F1</kbd>{' '}
                      ヘルプ表示
                    </li>
                    <li>
                      <kbd className="bg-muted rounded px-2 py-1 font-mono text-xs">Home/End</kbd>{' '}
                      時間端移動
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div
            className={cn(
              'bg-muted/50 border-t px-6 py-4',
              getContrastClassName('border-border bg-muted/50', 'contrast-border contrast-bg'),
            )}
          >
            <div className="flex justify-end space-x-3">
              <Dialog.Close asChild>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className={cn(
                    getContrastClassName(
                      '',
                      'contrast-text contrast-bg contrast-border hover:contrast-selected focus:contrast-focus',
                    ),
                  )}
                >
                  閉じる
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
