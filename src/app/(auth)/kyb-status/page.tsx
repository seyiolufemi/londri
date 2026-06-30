"use client"

import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="px-12 py-8">
        <img src="/logo+wordmark-teal.png" alt="Londri" className="h-7 w-auto" />
      </header>

      <main className="flex flex-1 items-center justify-center px-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Clock className="size-9 text-primary" />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-foreground">
            Application submitted
          </h1>

          <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            We've received your details and our team will review your application within 48 hours.
            You'll be notified via WhatsApp and email once there's an update.
          </p>

          <div className="mt-4 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
            Under Review
          </div>

          <div className="mt-8 w-full max-w-xs">
            <Button variant="default" className="w-full" onClick={() => router.push("/overview")}>
              Go to your dashboard
            </Button>
          </div>

          <p className="mt-4 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
            You can explore your dashboard while we review your application. Some features will be
            limited until you're verified.
          </p>
        </div>
      </main>
    </div>
  )
}
