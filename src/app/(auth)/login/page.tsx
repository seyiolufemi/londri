"use client"

import { useState, type SubmitEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AnimatedPanel from "@/components/auth/AnimatedPanel"
import { useAppDispatch } from "@/hooks/redux"
import { apiManager } from "@/redux/apiManager"
import { useLoginOwnerMutation } from "@/redux/api/authApi"
import { getApiErrorMessage } from "@/lib/apiError"

interface FormErrors {
  email?: string
  password?: string
}

export default function Page() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [loginOwner, { isLoading }] = useLoginOwnerMutation()

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault()

    const next: FormErrors = {}
    if (!email.trim()) {
      next.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address"
    }
    if (!password) next.password = "Password is required"

    setErrors(next)
    if (Object.keys(next).length > 0) return

    try {
      await loginOwner({ email, password }).unwrap()
      dispatch(apiManager.util.resetApiState())
      toast.success("Welcome back")
      router.push("/overview")
    } catch (error) {
      toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Invalid email or password"))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left column ── */}
      <div className="relative flex w-1/2 flex-col bg-background px-12 py-12">
        <img
          src="/logo+wordmark-teal.png"
          alt="Londri"
          className="absolute top-16 left-1/2 -translate-x-1/2 h-9 w-auto object-contain"
        />
        <div className="flex flex-1 flex-col justify-center pt-16">
          <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">
            Sign in to manage your laundry business.
          </p>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="amara@sparklewash.ng"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email") }}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError("password") }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="mt-6 w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary">Sign up</Link>
          </p>
        </div>
      </div>

      <AnimatedPanel />
    </div>
  )
}
