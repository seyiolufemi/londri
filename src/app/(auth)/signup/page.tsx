"use client"

import { useState, type SubmitEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react"
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
import {
  useRegisterOwnerMutation,
  useVerifyOwnerEmailMutation,
  useResendOwnerVerificationMutation,
  useLoginOwnerMutation,
} from "@/redux/api/authApi"
import { getApiErrorMessage } from "@/lib/apiError"
import { normalizeNigerianPhone } from "@/lib/phone"

interface FormErrors {
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
  password?: string
}

export default function Page() {
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState("")

  const signupData = useStore((s) => s.signupData)
  const signupStep = useStore((s) => s.signupStep)
  const setSignupData = useStore((s) => s.setSignupData)
  const setSignupStep = useStore((s) => s.setSignupStep)
  const resetKybData = useStore((s) => s.resetKybData)

  const [registerOwner, { isLoading: isRegistering }] = useRegisterOwnerMutation()
  const [verifyOwnerEmail, { isLoading: isVerifying }] = useVerifyOwnerEmailMutation()
  const [resendOwnerVerification, { isLoading: isResending }] = useResendOwnerVerificationMutation()
  const [loginOwner, { isLoading: isLoggingIn }] = useLoginOwnerMutation()

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  const validateStep1 = () => {
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

    if (!signupData.phone.trim()) {
      next.phone = "Phone number is required"
    } else if (!/^\+234\d{10}$/.test(normalizeNigerianPhone(signupData.phone))) {
      next.phone = "Enter a valid Nigerian phone number"
    }

    if (!signupData.password) {
      next.password = "Password is required"
    } else if (signupData.password.length < 8) {
      next.password = "Password must be at least 8 characters"
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSendCode = async (e: SubmitEvent) => {
    e.preventDefault()
    if (!validateStep1()) return

    const normalizedPhone = normalizeNigerianPhone(signupData.phone)
    if (normalizedPhone !== signupData.phone) setSignupData({ phone: normalizedPhone })

    try {
      await registerOwner({
        name: signupData.ownerName,
        email: signupData.email,
        password: signupData.password,
        phone: normalizedPhone,
      }).unwrap()

      toast.success("Verification code sent to your email")
      setSignupStep(2)
    } catch (error) {
      toast.error(getApiErrorMessage((error as { data?: unknown }).data))
    }
  }

  const handleResendCode = async () => {
    try {
      await resendOwnerVerification({ email: signupData.email }).unwrap()
      toast.success("Verification code resent")
    } catch (error) {
      toast.error(getApiErrorMessage((error as { data?: unknown }).data))
    }
  }

  const handleVerify = async (e: SubmitEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email")
      return
    }

    try {
      await verifyOwnerEmail({ email: signupData.email, otp_code: otp }).unwrap()
      await loginOwner({ email: signupData.email, password: signupData.password }).unwrap()

      resetKybData()
      toast.success("Email verified")
      router.push("/kyb")
    } catch (error) {
      toast.error(getApiErrorMessage((error as { data?: unknown }).data))
    }
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

              <form onSubmit={handleSendCode}>
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
                      onBlur={(e) => setSignupData({ phone: normalizeNigerianPhone(e.target.value) })}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={signupData.password}
                        onChange={(e) => {
                          setSignupData({ password: e.target.value })
                          clearError("password")
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="mt-6 w-full"
                  disabled={isRegistering}
                >
                  {isRegistering && <Loader2 className="size-4 animate-spin" />}
                  Send verification code
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary">Sign in</Link>
              </p>
            </>
          )}

          {signupStep === 2 && (
            <>
              <button
                type="button"
                className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
                onClick={() => setSignupStep(1)}
              >
                <ChevronLeft className="size-4" />
                Back
              </button>

              <h1 className="text-2xl font-semibold text-foreground">
                Check your email
              </h1>
              <p className="mt-2 mb-8 text-sm text-muted-foreground">
                We sent a 6-digit code to {signupData.email}
              </p>

              <form onSubmit={handleVerify}>
                <InputOTP maxLength={6} containerClassName="gap-3" value={otp} onChange={setOtp}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPGroup key={i}>
                      <InputOTPSlot index={i} className="size-12 text-base" />
                    </InputOTPGroup>
                  ))}
                </InputOTP>

                <Button
                  type="submit"
                  variant="default"
                  className="mt-6 w-full"
                  disabled={isVerifying || isLoggingIn}
                >
                  {(isVerifying || isLoggingIn) && <Loader2 className="size-4 animate-spin" />}
                  Verify & continue
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-primary disabled:opacity-50"
                >
                  {isResending ? "Resending…" : "Resend code"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <AnimatedPanel />
    </div>
  )
}
