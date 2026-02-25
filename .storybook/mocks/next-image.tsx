import type { ImgHTMLAttributes } from 'react';

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
};

function NextImage({ fill, priority, quality, sizes, unoptimized, ...props }: NextImageProps) {
  const style = fill
    ? {
        position: 'absolute' as const,
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: props.style?.objectFit ?? ('cover' as const),
      }
    : undefined;

  // eslint-disable-next-line @next/next/no-img-element
  return <img alt="" {...props} style={{ ...style, ...props.style }} />;
}

export { NextImage as default };
