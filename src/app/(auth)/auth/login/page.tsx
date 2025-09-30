import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/features/auth"

const LoginPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-blue-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            BoxLog
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-neutral-200 dark:bg-neutral-700 relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20">
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center flex flex-col gap-4">
              <div className="text-6xl font-bold text-neutral-600 dark:text-neutral-400 opacity-60">📦</div>
              <h2 className="text-3xl font-bold text-neutral-600 dark:text-neutral-400">
                Welcome to BoxLog
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 opacity-80 max-w-md">
                The modern task management system that helps you stay organized and productive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
