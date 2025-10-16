import { PasswordResetForm } from '@/features/auth'

export default function PasswordResetPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full md:max-w-5xl">
        <PasswordResetForm />
      </div>
    </div>
  )
}
