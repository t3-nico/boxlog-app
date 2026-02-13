/**
 * ダークモード対応 DocsContainer
 *
 * @vueless/storybook-dark-mode は docs.theme を自動切替しないため、
 * useDarkMode() で検出し DocsContainer の theme を動的に切り替える。
 *
 * @see https://github.com/vuelessjs/storybook-dark-mode#docs-integration
 */
import type { ComponentProps } from 'react';

import { DocsContainer } from '@storybook/addon-docs/blocks';
import { useDarkMode } from '@vueless/storybook-dark-mode';

import { dayoptDarkTheme, dayoptLightTheme } from './dayoptTheme';

type DocsContainerProps = ComponentProps<typeof DocsContainer>;

export function ThemedDocsContainer({ children, ...props }: DocsContainerProps) {
  const isDark = useDarkMode();

  return (
    <DocsContainer {...props} theme={isDark ? dayoptDarkTheme : dayoptLightTheme}>
      {children}
    </DocsContainer>
  );
}
