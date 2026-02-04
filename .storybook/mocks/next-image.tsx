/**
 * next/image のStorybook用モック
 * Vite環境でNext.js Imageが動作しないため、通常のimg要素で代替
 */
import * as React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  unoptimized?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  style?: React.CSSProperties;
}

function Image({ src, alt, fill, width, height, className, style, ...props }: ImageProps) {
  const imgStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }
    : style || {};

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={imgStyle}
      {...props}
    />
  );
}

export default Image;
