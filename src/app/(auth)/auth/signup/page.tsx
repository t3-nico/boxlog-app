import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "@/features/auth"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
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
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-muted-foreground/60">🚀</div>
              <h2 className="text-3xl font-bold text-muted-foreground">
                Start your productivity journey
              </h2>
              <p className="text-lg text-muted-foreground/80 max-w-md">
                Join thousands of users who trust BoxLog to organize their tasks and achieve their goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
