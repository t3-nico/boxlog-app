/**
 * Storybook Docs カスタムテンプレート
 *
 * <Unstyled> でStorybookのデフォルトCSS を無効化し、
 * .sb-docs-prose クラスで prose.css のタイポグラフィを適用。
 *
 * @see prose.css - Dayoptセマンティックトークンベースのタイポグラフィ
 * @see https://github.com/digital-go-jp/design-system-example-components-react
 */
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
  Unstyled,
} from '@storybook/addon-docs/blocks';

export function DocsTemplate() {
  return (
    <Unstyled>
      <div className="sb-docs-prose">
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <Controls />
        <Stories includePrimary={false} />
      </div>
    </Unstyled>
  );
}
