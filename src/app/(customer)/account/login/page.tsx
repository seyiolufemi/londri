"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { useAppDispatch } from "@/hooks/redux"
import { apiManager } from "@/redux/apiManager"
import { useRequestCustomerOtpMutation, useVerifyCustomerOtpMutation } from "@/redux/api/customerAuthApi"
import { apiError } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "details" | "otp"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  email?: string
}

export default function CustomerLoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const setCustomerAuth = useStore((s) => s.setCustomerAuth)

  const [step, setStep] = useState<Step>("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [otp, setOtp] = useState("")

  const [requestOtp, { isLoading: isSending }] = useRequestCustomerOtpMutation()
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyCustomerOtpMutation()

  async function handleSendCode() {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = "Name is required"
    if (!email.trim()) newErrors.email = "Email address is required"
    else if (!EMAIL_PATTERN.test(email.trim())) newErrors.email = "Enter a valid email address"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await requestOtp({ name: name.trim(), email: email.trim() }).unwrap()
      toast.success("Verification code sent to your email")
      setOtp("")
      setStep("otp")
    } catch (error) {
      toast.error(apiError(error, "Couldn't send verification code"))
    }
  }

  async function handleVerify() {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email")
      return
    }

    try {
      const { id, role, is_new_user } = await verifyOtp({
        email: email.trim(),
        otp_code: otp,
      }).unwrap()

      dispatch(apiManager.util.resetApiState())
      setCustomerAuth({ id, name: name.trim(), email: email.trim(), role })
      toast.success(is_new_user ? `Welcome, ${name.trim()}!` : "Signed in")
      router.push("/account/orders")
    } catch (error) {
      toast.error(apiError(error, "Invalid or expired code"))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-16">
        {step === "details" && (
          <>
            <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-foreground">
              Sign in
            </h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">
              Enter your details to track and view your orders.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="account-name" className="mb-1.5 block text-sm">
                  Full name
                </Label>
                <Input
                  id="account-name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
                  }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="account-email" className="mb-1.5 block text-sm">
                  Email address
                </Label>
                <Input
                  id="account-email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((er) => ({ ...er, email: undefined }))
                  }}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>

            <Button className="mt-6 w-full" onClick={handleSendCode} disabled={isSending}>
              {isSending && <Loader2 className="size-4 animate-spin" />}
              Send code
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <button
              className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
              onClick={() => setStep("details")}
            >
              <ChevronLeft className="size-4" />
              Back
            </button>

            <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">
              We sent a 6-digit code to {email}
            </p>

            <InputOTP maxLength={6} containerClassName="gap-3" value={otp} onChange={setOtp}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPGroup key={i}>
                  <InputOTPSlot index={i} className="size-12 text-base" />
                </InputOTPGroup>
              ))}
            </InputOTP>

            <Button className="mt-6 w-full" onClick={handleVerify} disabled={isVerifying}>
              {isVerifying && <Loader2 className="size-4 animate-spin" />}
              Verify
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
