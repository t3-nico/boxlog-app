import { redirect } from 'next/navigation'

export default function RedirectHome() {
  // Next.js の redirect を使用してビルド時の問題を回避
  redirect('/calendar')
}
