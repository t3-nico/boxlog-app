/**
 * BoxLog デザインシステム コンポーネント統一エクスポート
 */

// Typography コンポーネント
export {
  Typography,
  H1, H2, H3, H4, H5, H6,
  BodyLarge, Body, BodySmall,
  Label, ErrorText, Caption, Code,
  PageTitle,
  SectionTitle,
  CardTitle,
  TypographyShowcase,
  type TypographyVariant
} from './Typography'

// Spacing コンポーネント
export {
  // 8pxグリッド推奨コンポーネント
  Stack,
  Inline,
  PageContainer,
  Card,
  FormGroup,
  Grid,
  
  // 従来のSpacingコンポーネント（互換性維持）
  Spacing,
  PageSpacing,
  SectionSpacing,
  ContentSpacing,
  CardSpacing,
  InlineSpacing,
  ResponsivePageSpacing,
  ResponsiveSectionSpacing,
  SpacingShowcase
} from './Spacing'