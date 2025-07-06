import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; error: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Paceful
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {searchParams?.message && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{searchParams.message}</p>
          </div>
        )}

        {searchParams?.error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {searchParams.error === 'auth' 
                ? 'Authentication failed. Please try again.' 
                : searchParams.error}
            </p>
          </div>
        )}

        <AuthForm mode="login" />
      </div>
    </div>
  )
}