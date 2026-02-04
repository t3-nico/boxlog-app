/**
 * next/link のStorybook用モック
 * Vite環境でNext.js Linkが動作しないため、通常のa要素で代替
 */
import * as React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
  children: React.ReactNode;
}

function Link({
  href,
  children,
  prefetch,
  replace,
  scroll,
  shallow,
  passHref,
  legacyBehavior,
  ...props
}: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export default Link;
