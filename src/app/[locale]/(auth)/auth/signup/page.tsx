import { GalleryVerticalEnd } from 'lucide-react'

import { SignupForm } from '@/features/auth'

const SignupPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            BoxLog
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-blue-600/20 to-purple-600/20">
          <div className="flex h-full items-center justify-center p-8">
            <div className="space-y-4 text-center">
              <div className="text-muted-foreground/60 text-6xl font-bold">🚀</div>
              <h2 className="text-muted-foreground text-3xl font-bold">Start your productivity journey</h2>
              <p className="text-muted-foreground/80 max-w-md text-lg">
                Join thousands of users who trust BoxLog to organize their tasks and achieve their goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
