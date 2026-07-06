"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "email" | "otp"

export default function CustomerLoginPage() {
  const router = useRouter()
  const setCustomerAuth = useStore((s) => s.setCustomerAuth)

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [otp, setOtp] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  function handleSendCode() {
    if (!email.trim()) {
      setEmailError("Email address is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address")
      return
    }
    setEmailError("")
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      toast.success("Verification code sent to your email")
      setStep("otp")
    }, 800)
  }

  function handleVerify() {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email")
      return
    }
    setIsVerifying(true)
    setTimeout(() => {
      setCustomerAuth(email)
      setIsVerifying(false)
      toast.success("Signed in")
      router.push("/account/orders")
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-16">
        {step === "email" && (
          <>
            <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-foreground">
              Sign in
            </h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">
              Enter your email to track and view your orders.
            </p>

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
                  if (emailError) setEmailError("")
                }}
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
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
              onClick={() => setStep("email")}
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
