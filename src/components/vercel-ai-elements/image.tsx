import { cn } from '@/lib/utils'
import type { Experimental_GeneratedImage } from 'ai'
import NextImage from 'next/image'

export type ImageProps = Experimental_GeneratedImage & {
  className?: string
  alt?: string
  width?: number
  height?: number
}

export const Image = ({ base64, uint8Array, mediaType, width = 512, height = 512, ...props }: ImageProps) => (
  <NextImage
    src={`data:${mediaType};base64,${base64}`}
    alt={props.alt || ''}
    width={width}
    height={height}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    unoptimized
  />
)
