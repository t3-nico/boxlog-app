import type { HTMLAttributes } from 'react'

import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import { type BundledLanguage, type CodeOptionsMultipleThemes, codeToHtml } from 'shiki'

import { sanitizeCodeBlock } from '@/lib/security/sanitize'

export type CodeBlockContentProps = HTMLAttributes<HTMLDivElement> & {
  themes?: CodeOptionsMultipleThemes['themes']
  language?: BundledLanguage
  children: string
  syntaxHighlighting?: boolean
}

export const CodeBlockContent = async ({
  children,
  themes,
  language,
  syntaxHighlighting = true,
  ...props
}: CodeBlockContentProps) => {
  const html = syntaxHighlighting
    ? await codeToHtml(children as string, {
        lang: language ?? 'typescript',
        themes: themes ?? {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
        transformers: [
          transformerNotationDiff({
            matchAlgorithm: 'v3',
          }),
          transformerNotationHighlight({
            matchAlgorithm: 'v3',
          }),
          transformerNotationWordHighlight({
            matchAlgorithm: 'v3',
          }),
          transformerNotationFocus({
            matchAlgorithm: 'v3',
          }),
          transformerNotationErrorLevel({
            matchAlgorithm: 'v3',
          }),
        ],
      })
    : children

  return (
    <div
      // XSS防止: ShikiのHTMLアウトプットをサニタイズ
      dangerouslySetInnerHTML={{ __html: sanitizeCodeBlock(html) }}
      {...props}
    />
  )
}
