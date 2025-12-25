import { SignupForm } from '@/features/auth';

export default function SignupPage() {
  return (
    <div className="bg-surface-container flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full md:max-w-5xl">
        <SignupForm />
      </div>
    </div>
  );
}
