import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="bg-surface-container flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full md:max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}
