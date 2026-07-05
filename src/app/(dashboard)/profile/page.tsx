"use client"

import { useState } from "react"
import { Pencil, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import UploadZone from "@/components/shared/UploadZone"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

// ─── Personal Info Section ────────────────────────────────────────────────────

function PersonalInfoSection() {
  const storedEmail = useStore((s) => s.profileEmail)
  const storedPhone = useStore((s) => s.profilePhone)
  const avatarUrl = useStore((s) => s.profileAvatarUrl)
  const setProfileEmail = useStore((s) => s.setProfileEmail)
  const setProfilePhone = useStore((s) => s.setProfilePhone)
  const setProfileAvatarUrl = useStore((s) => s.setProfileAvatarUrl)

  const [email, setEmail] = useState(storedEmail)
  const [phone, setPhone] = useState(storedPhone)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [otpValue, setOtpValue] = useState("")

  function handleSave() {
    setProfileEmail(email)
    if (phone !== storedPhone) {
      setVerifyingPhone(true)
      setOtpValue("")
    } else {
      toast.success("Profile updated")
    }
  }

  function handleVerifyPhone() {
    setProfilePhone(phone)
    setVerifyingPhone(false)
    setOtpValue("")
    toast.success("Phone number updated")
  }

  function handleCancelVerify() {
    setPhone(storedPhone)
    setVerifyingPhone(false)
    setOtpValue("")
  }

  function handleSaveAvatar() {
    if (!avatarFile) return
    const url = URL.createObjectURL(avatarFile)
    setProfileAvatarUrl(url)
    setAvatarDialogOpen(false)
    setAvatarFile(null)
    toast.success("Profile photo updated")
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      {/* Avatar row */}
      <div className="mb-6">
        <div className="relative inline-block">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-primary">AO</span>
            )}
          </div>
          <button
            type="button"
            aria-label="Change profile photo"
            onClick={() => setAvatarDialogOpen(true)}
            className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted"
          >
            <Pencil className="size-3 text-foreground" />
          </button>
        </div>
      </div>

      {verifyingPhone ? (
        /* ── OTP verification view ── */
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{phone}</span>
          </p>
          <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <div className="flex gap-3">
            <Button
              onClick={handleVerifyPhone}
              disabled={otpValue.length !== 6}
            >
              Verify &amp; Save
            </Button>
            <Button variant="ghost" className="text-sm" onClick={handleCancelVerify}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* ── Normal fields view ── */
        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-name" className="mb-1.5 block text-sm">
              Full name
            </Label>
            <Input id="profile-name" value="Amara Okonkwo" disabled />
            <p className="mt-1 text-xs text-muted-foreground">
              To update your legal name, contact support.
            </p>
          </div>

          <div>
            <Label htmlFor="profile-email" className="mb-1.5 block text-sm">
              Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="profile-phone" className="mb-1.5 block text-sm">
              Phone number
            </Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="profile-role" className="mb-1.5 block text-sm">
              Role
            </Label>
            <Input id="profile-role" value="Owner" disabled />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      )}

      {/* Avatar upload dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
          </DialogHeader>
          <UploadZone
            label="Upload a photo"
            hint="JPG, PNG or WebP up to 2MB"
            accept="image/*"
            onFileChange={setAvatarFile}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAvatarDialogOpen(false)
                setAvatarFile(null)
              }}
            >
              Cancel
            </Button>
            <Button disabled={!avatarFile} onClick={handleSaveAvatar}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Change Password Section ──────────────────────────────────────────────────

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const meetsLength = newPassword.length >= 8
  const passwordsMatch = confirmPassword === newPassword
  const showMismatch = confirmPassword.length > 0 && newPassword.length > 0 && !passwordsMatch

  const canSubmit =
    currentPassword.length > 0 && meetsLength && confirmPassword.length > 0 && passwordsMatch

  function handleUpdatePassword() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    toast.success("Password updated successfully")
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Change Password</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="current-password" className="mb-1.5 block text-sm">
            Current password
          </Label>
          <Input
            id="current-password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="new-password" className="mb-1.5 block text-sm">
            New password
          </Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              meetsLength ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {meetsLength && <CheckCircle2 className="size-3 shrink-0" />}
            At least 8 characters
          </p>
        </div>

        <div>
          <Label htmlFor="confirm-password" className="mb-1.5 block text-sm">
            Confirm new password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {showMismatch && (
            <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <Button onClick={handleUpdatePassword} disabled={!canSubmit}>
          Update Password
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
          Profile
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your personal account details
        </p>
      </div>

      <div className="flex max-w-xl flex-col gap-6">
        <PersonalInfoSection />
        <ChangePasswordSection />
      </div>
    </div>
  )
}
