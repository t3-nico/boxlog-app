// import { redirect } from 'next/navigation'
// import { supabaseServer } from '@/lib/supabase-server' // Disabled for localStorage mode

export default function PrivatePage() {
  // ローカル専用モード: 常にアクセス可能
  return <p className="text-center mt-16 text-xl">Hello local user (localStorage mode)</p>
} 
