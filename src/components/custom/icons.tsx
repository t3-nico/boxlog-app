import { icons } from '@/config/theme'

export function GoogleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={icons.social} {...props}>
      <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C35.9 2.5 30.1 0 24 0 15.5 0 8 5.9 3.5 14.5l7.4 5.9C12 15.9 17.5 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M47.3 24.9c0-1.8-.2-3.6-.5-5.3H24v10h13.1c-.6 3-2.2 5.6-4.8 7.3l7.7 6C44.6 39.8 47.3 33.7 47.3 24.9Z" />
      <path fill="#FBBC05" d="M9.9 28.9a15 15 0 0 1-.5-4.9c0-1.7.3-3.4.8-5l-7.8-6.5A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.3-5.9Z" />
      <path fill="#34A853" d="M24 48c6.6 0 12.2-2.2 16.3-6l-7.7-6c-2.1 1.4-4.9 2.3-8.6 2.3-6.6 0-12.1-4.4-14.1-10.4L2 32.8C5.4 41.5 12.9 48 24 48Z" />
    </svg>
  )
}

export function AppleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={icons.social} {...props}>
      <path d="M16.5 1.5c-1.3 0-2.8.9-3.6 2-.8 1-1.4 2.5-1.1 3.9 1.5 0 3-.9 3.8-2 0.8-1 1.5-2.6 1.5-3.9Z" fill="currentColor" />
      <path d="M19 14.2c-.1-3 2.3-4.4 2.4-4.5-1.4-2-3.5-2.3-4.2-2.4-1.8-.2-3.4 1-4.3 1-1 0-2.6-1-4.2-.9-2.1 0-4.2 1.2-5.3 3-2.2 3.7-.6 9 1.7 12 1 1.4 2.1 3 3.7 2.9 1.5 0 2.1-1 4.1-1 2 0 2.5 1 4.2 1 1.7 0 2.7-1.5 3.6-2.8 1.1-1.7 1.5-3.3 1.5-3.4-0.1 0-3.3-1.2-3.4-4.9Z" fill="currentColor" />
    </svg>
  )
}
