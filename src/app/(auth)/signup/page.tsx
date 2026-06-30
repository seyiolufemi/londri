"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import AnimatedPanel from "@/components/auth/AnimatedPanel"
import { useStore } from "@/lib/mock/store"

interface FormErrors {
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
}

export default function Page() {
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({})

  const signupData = useStore((s) => s.signupData)
  const signupStep = useStore((s) => s.signupStep)
  const setSignupData = useStore((s) => s.setSignupData)
  const setSignupStep = useStore((s) => s.setSignupStep)

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  const handleSendCode = () => {
    const next: FormErrors = {}

    if (!signupData.businessName.trim())
      next.businessName = "Business name is required"

    if (!signupData.ownerName.trim())
      next.ownerName = "Owner full name is required"

    if (!signupData.email.trim()) {
      next.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      next.email = "Enter a valid email address"
    }

    const normalized = signupData.phone.trim().replace(/\s/g, "")
    const digits = signupData.phone.replace(/\D/g, "")
    if (!signupData.phone.trim()) {
      next.phone = "Phone number is required"
    } else if (
      (!normalized.startsWith("+234") && !normalized.startsWith("0")) ||
      digits.length < 11
    ) {
      next.phone = "Must start with +234 or 0 and be at least 11 digits"
    }

    setErrors(next)
    if (Object.keys(next).length === 0) setSignupStep(2)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left column ── */}
      <div className="relative flex w-1/2 flex-col bg-background px-12 py-12">
        {signupStep === 1 && (
          <img
            src="/logo+wordmark-teal.png"
            alt="Londri"
            className="absolute top-16 left-1/2 -translate-x-1/2 h-9 w-auto object-contain"
          />
        )}
        <div className="flex flex-1 flex-col justify-center pt-16">
          {signupStep === 1 && (
            <>
              <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-foreground">
                Create your account
              </h1>
              <p className="mt-2 mb-8 text-sm text-muted-foreground">
                Start accepting orders and managing your laundry business online.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="business-name">Business name <span className="text-destructive">*</span></Label>
                  <Input
                    id="business-name"
                    placeholder="Sparkle Wash Laundry"
                    value={signupData.businessName}
                    onChange={(e) => {
                      setSignupData({ businessName: e.target.value })
                      clearError("businessName")
                    }}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-destructive">{errors.businessName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="owner-name">Owner full name <span className="text-destructive">*</span></Label>
                  <Input
                    id="owner-name"
                    placeholder="Amara Okonkwo"
                    value={signupData.ownerName}
                    onChange={(e) => {
                      setSignupData({ ownerName: e.target.value })
                      clearError("ownerName")
                    }}
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-xs text-destructive">{errors.ownerName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="amara@sparklewash.ng"
                    value={signupData.email}
                    onChange={(e) => {
                      setSignupData({ email: e.target.value })
                      clearError("email")
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={signupData.phone}
                    onChange={(e) => {
                      setSignupData({ phone: e.target.value })
                      clearError("phone")
                    }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <Button
                variant="default"
                className="mt-6 w-full"
                onClick={handleSendCode}
              >
                Send verification code
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <span className="cursor-pointer text-primary">Sign in</span>
              </p>
            </>
          )}

          {signupStep === 2 && (
            <>
              <button
                className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
                onClick={() => setSignupStep(1)}
              >
                <ChevronLeft className="size-4" />
                Back
              </button>

              <h1 className="text-2xl font-semibold text-foreground">
                Check your WhatsApp
              </h1>
              <p className="mt-2 mb-8 text-sm text-muted-foreground">
                We sent a 6-digit code to {signupData.phone || "+234 801 234 5678"}
              </p>

              <InputOTP maxLength={6} containerClassName="gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPGroup key={i}>
                    <InputOTPSlot index={i} className="size-12 text-base" />
                  </InputOTPGroup>
                ))}
              </InputOTP>

              <Button
                variant="default"
                className="mt-6 w-full"
                onClick={() => router.push("/kyb")}
              >
                Verify & continue
              </Button>
            </>
          )}
        </div>
      </div>

      <AnimatedPanel />
    </div>
  )
}
