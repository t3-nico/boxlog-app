import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface NextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  children: ReactNode;
}

function NextLink({ href, prefetch, replace, scroll, children, ...props }: NextLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export { NextLink as default };
