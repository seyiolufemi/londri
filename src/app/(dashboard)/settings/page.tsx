"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, XCircle, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import type { BusinessProfileSettings } from "@/lib/mock/store"
import type { OperatingDay } from "@/types"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { KybStatus } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const NIGERIAN_BANKS = [
  { name: "GTBank", code: "058" },
  { name: "Access Bank", code: "044" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank", code: "011" },
  { name: "UBA", code: "033" },
  { name: "Sterling Bank", code: "232" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Keystone Bank", code: "082" },
  { name: "Polaris Bank", code: "076" },
  { name: "Fidelity Bank", code: "070" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const ILLUSTRATION_VARIANTS = [
  "variant-01-white.svg",
  "variant-02-coral.svg",
  "variant-03-navy.svg",
  "variant-04-sage.svg",
  "variant-05-mustard.svg",
  "variant-06-rose.svg",
  "variant-07-charcoal.svg",
  "variant-08-skyblue.svg",
  "variant-09-plum.svg",
]

const MATCH_TOKENS = ["amara", "okonkwo", "sparkle", "wash", "laundry"]

function verifiedNameMatches(name: string): boolean {
  const lower = name.toLowerCase()
  return MATCH_TOKENS.some((token) => lower.includes(token))
}

const FALLBACK_DAY: OperatingDay = { open: false, openTime: "08:00", closeTime: "18:00" }

// ─── Verification Tab ─────────────────────────────────────────────────────────

function VerificationTab({
  kybStatus,
  onResubmit,
}: {
  kybStatus: KybStatus
  onResubmit: () => void
}) {
  if (kybStatus === "approved") {
    return (
      <div className="max-w-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Verified</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your business was verified on January 20, 2025
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Verified
        </span>
      </div>
    )
  }

  if (kybStatus === "pending" || kybStatus === "under_review") {
    return (
      <div className="max-w-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <Clock className="size-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Verification in progress</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              We&apos;re reviewing your application. This usually takes under 48 hours.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
          {kybStatus === "under_review" ? "Under Review" : "Pending"}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-sm space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-7 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Verification unsuccessful</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Please review the reason below and resubmit your documents.
          </p>
        </div>
      </div>
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        Rejected
      </span>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">Reason for rejection</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The CAC certificate provided appears to be expired or invalid. Please upload a valid,
          current CAC certificate and resubmit your application.
        </p>
      </div>
      <Button onClick={onResubmit}>Resubmit Documents</Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const { kybStatus } = useKybStatus()

  const businessProfile = useStore((s) => s.businessProfile)
  const setBusinessProfile = useStore((s) => s.setBusinessProfile)
  const storedBankName = useStore((s) => s.businessBankName)
  const storedAccountNumber = useStore((s) => s.businessAccountNumber)
  const storedAccountName = useStore((s) => s.businessAccountName)
  const setBusinessBankDetails = useStore((s) => s.setBusinessBankDetails)

  // ── Tab 1: Business Profile ───────────────────────────────────────────────
  const [profileName, setProfileName] = useState(businessProfile.businessName)
  const [profileAddress, setProfileAddress] = useState(businessProfile.address)
  const [profileRadius, setProfileRadius] = useState(String(businessProfile.serviceAreaRadius))
  const [profileIllustration, setProfileIllustration] = useState(businessProfile.illustrationIndex)
  const [operatingHours, setOperatingHours] = useState<Record<string, OperatingDay>>(
    businessProfile.operatingHours
  )

  function handleSaveProfile() {
    const updates: Partial<BusinessProfileSettings> = {
      businessName: profileName,
      address: profileAddress,
      serviceAreaRadius: Number(profileRadius) || 5,
      illustrationIndex: profileIllustration,
      operatingHours,
    }
    setBusinessProfile(updates)
    toast.success("Business profile updated")
  }

  function toggleDay(day: string) {
    setOperatingHours((prev) => {
      const current = prev[day] ?? FALLBACK_DAY
      return { ...prev, [day]: { ...current, open: !current.open } }
    })
  }

  function updateDayTime(day: string, field: "openTime" | "closeTime", value: string) {
    setOperatingHours((prev) => {
      const current = prev[day] ?? FALLBACK_DAY
      return { ...prev, [day]: { ...current, [field]: value } }
    })
  }

  // ── Tab 2: Payout Settings ────────────────────────────────────────────────
  const [bankName, setBankName] = useState(storedBankName)
  const [accountNumber, setAccountNumber] = useState(storedAccountNumber)
  const [verifiedAccountName, setVerifiedAccountName] = useState(storedAccountName)
  const [verificationState, setVerificationState] = useState<"idle" | "verifying" | "verified">(
    "idle"
  )
  const [verificationError, setVerificationError] = useState("")

  const verifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)

    const changed = bankName !== storedBankName || accountNumber !== storedAccountNumber

    if (!changed) {
      setVerificationState("idle")
      setVerifiedAccountName(storedAccountName)
      setVerificationError("")
      return
    }

    if (accountNumber.length === 10 && bankName !== "") {
      setVerificationState("verifying")
      setVerifiedAccountName("")
      setVerificationError("")

      verifyTimeoutRef.current = setTimeout(() => {
        const mockName = accountNumber.endsWith("0000") ? "JOHN DOE ENTERPRISES" : "AMARA OKONKWO"
        setVerifiedAccountName(mockName)
        setVerificationState("verified")
        if (!verifiedNameMatches(mockName)) {
          setVerificationError("Account name must match your registered business or owner name")
        }
      }, 1500)
    } else {
      setVerificationState("idle")
      setVerifiedAccountName("")
      setVerificationError("")
    }

    return () => {
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)
    }
  }, [accountNumber, bankName, storedBankName, storedAccountNumber, storedAccountName])

  const hasPayoutChanges = bankName !== storedBankName || accountNumber !== storedAccountNumber

  const payoutSaveDisabled =
    hasPayoutChanges &&
    (verificationState !== "verified" || !verifiedNameMatches(verifiedAccountName))

  function handleSavePayout() {
    setBusinessBankDetails(bankName, accountNumber, verifiedAccountName)
    toast.success("Payout details updated")
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
          Settings
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your business profile, payouts, and verification
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="payout">Payout Settings</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Business Profile ── */}
        <TabsContent value="profile">
          <div className="max-w-2xl space-y-6">
            <div>
              <Label htmlFor="biz-name" className="mb-1.5 block text-sm">
                Business name
              </Label>
              <Input
                id="biz-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This is how customers will see your business.
              </p>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Operating Hours</Label>
              <p className="mb-3 text-xs text-muted-foreground">
                Customers see when you&apos;re open before booking a pickup.
              </p>
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                {DAYS.map((day, idx) => {
                  const dayData = operatingHours[day] ?? FALLBACK_DAY
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3",
                        idx > 0 && "border-t border-border"
                      )}
                    >
                      <span className="w-9 shrink-0 text-sm font-medium text-foreground">
                        {day}
                      </span>
                      <Switch
                        checked={dayData.open}
                        onCheckedChange={() => toggleDay(day)}
                        aria-label={`${day} open`}
                      />
                      <div
                        className={cn(
                          "flex items-center gap-2 transition-opacity",
                          !dayData.open && "opacity-40"
                        )}
                      >
                        <Input
                          type="time"
                          value={dayData.openTime}
                          disabled={!dayData.open}
                          onChange={(e) => updateDayTime(day, "openTime", e.target.value)}
                          className="w-[120px]"
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={dayData.closeTime}
                          disabled={!dayData.open}
                          onChange={(e) => updateDayTime(day, "closeTime", e.target.value)}
                          className="w-[120px]"
                        />
                      </div>
                      {!dayData.open && (
                        <span className="ml-auto text-xs text-muted-foreground">Closed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="biz-address" className="mb-1.5 block text-sm">
                Address
              </Label>
              <Input
                id="biz-address"
                placeholder="12 Adeola Odeku Street, Victoria Island"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used to show your location to nearby customers.
              </p>
            </div>

            <div>
              <Label htmlFor="biz-radius" className="mb-1.5 block text-sm">
                Service Area Radius
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="biz-radius"
                  type="number"
                  placeholder="5"
                  value={profileRadius}
                  onChange={(e) => setProfileRadius(e.target.value)}
                  className="w-28"
                  min={1}
                  max={100}
                />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                How far you&apos;re willing to travel for pickup and delivery.
              </p>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Business Illustration</Label>
              <div className="grid grid-cols-5 gap-3">
                {ILLUSTRATION_VARIANTS.map((filename, idx) => (
                  <button
                    key={filename}
                    type="button"
                    onClick={() => setProfileIllustration(idx)}
                    aria-label={`Illustration ${idx + 1}`}
                    aria-pressed={profileIllustration === idx}
                    className={cn(
                      "relative flex h-16 w-full items-center justify-center rounded-lg border-2 bg-muted/20 p-1.5 transition-all",
                      profileIllustration === idx
                        ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/illustrations/washing-machines/${filename}`}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-contain"
                    />
                    {profileIllustration === idx && (
                      <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground/80">
                        <Check className="size-3 text-background" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Choose an illustration to represent your business on the customer landing page.
              </p>
            </div>

            <div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Payout Settings ── */}
        <TabsContent value="payout">
          <div className="max-w-md">
            <p className="mb-6 text-sm text-muted-foreground">
              This is where your earnings are transferred. Changing your account details requires
              re-verification.
            </p>

            <div className="space-y-5">
              <div>
                <Label htmlFor="bank-name" className="mb-1.5 block text-sm">
                  Bank name
                </Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger id="bank-name" className="w-full">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_BANKS.map((b) => (
                      <SelectItem key={b.code} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="acct-number" className="mb-1.5 block text-sm">
                  Account number
                </Label>
                <Input
                  id="acct-number"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10)
                    setAccountNumber(val)
                  }}
                  maxLength={10}
                  placeholder="0123456789"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="acct-name" className="mb-1.5 block text-sm">
                  Account name
                </Label>
                <div className="relative">
                  <Input
                    id="acct-name"
                    value={verificationState === "verifying" ? "" : verifiedAccountName}
                    disabled
                    placeholder={
                      verificationState === "verifying"
                        ? "Verifying..."
                        : hasPayoutChanges && verifiedAccountName === ""
                          ? "Enter a 10-digit account number"
                          : ""
                    }
                    className="pr-9"
                  />
                  {verificationState === "verifying" && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {verificationState === "verified" && verifiedNameMatches(verifiedAccountName) && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="size-4 text-green-600" />
                    </div>
                  )}
                </div>
                {verificationError && (
                  <p className="mt-1 text-xs text-destructive">{verificationError}</p>
                )}
              </div>

              <Button onClick={handleSavePayout} disabled={payoutSaveDisabled}>
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Verification ── */}
        <TabsContent value="verification">
          <VerificationTab kybStatus={kybStatus} onResubmit={() => router.push("/kyb")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
