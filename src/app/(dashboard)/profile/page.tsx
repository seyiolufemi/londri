"use client"

import { useState } from "react"
import { Pencil, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/api/authApi"
import { useUploadFileMutation } from "@/redux/api/uploadApi"
import { apiError } from "@/lib/apiError"
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

// ─── Personal Info Section ────────────────────────────────────────────────────

function PersonalInfoSection() {
  const { data: me } = useGetMeQuery()
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Seed the editable fields from /auth/me once it loads, rather than in an
  // effect — avoids an extra render pass (see react-hooks/set-state-in-effect).
  const [hasPrefilled, setHasPrefilled] = useState(false)
  if (me && !hasPrefilled) {
    setHasPrefilled(true)
    setName(me.name)
    setEmail(me.email)
    setPhone(me.phone)
  }

  async function handleSave() {
    try {
      await updateMe({ name: name.trim(), email: email.trim(), phone: phone.trim() }).unwrap()
      toast.success("Profile updated")
    } catch (error) {
      toast.error(apiError(error, "Couldn't update profile"))
    }
  }

  async function handleSaveAvatar() {
    if (!avatarFile) return
    try {
      const { url } = await uploadFile(avatarFile).unwrap()
      await updateMe({ profile_picture_url: url }).unwrap()
      setAvatarDialogOpen(false)
      setAvatarFile(null)
      toast.success("Profile photo updated")
    } catch (error) {
      toast.error(apiError(error, "Couldn't update profile photo"))
    }
  }

  const initials = (me?.name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      {/* Avatar row */}
      <div className="mb-6">
        <div className="relative inline-block">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {me?.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.profile_picture_url}
                alt="Profile photo"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-primary">{initials || "?"}</span>
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

      <div className="space-y-4">
        <div>
          <Label htmlFor="profile-name" className="mb-1.5 block text-sm">
            Full name
          </Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
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
          <Input id="profile-role" value={me?.role ?? ""} disabled />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

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
            <Button disabled={!avatarFile || isUploading} onClick={handleSaveAvatar}>
              {isUploading && <Loader2 className="size-4 animate-spin" />}
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
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const meetsLength = newPassword.length >= 8
  const passwordsMatch = confirmPassword === newPassword
  const showMismatch = confirmPassword.length > 0 && newPassword.length > 0 && !passwordsMatch

  const canSubmit =
    currentPassword.length > 0 && meetsLength && confirmPassword.length > 0 && passwordsMatch

  async function handleUpdatePassword() {
    try {
      await updateMe({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap()
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully")
    } catch (error) {
      toast.error(apiError(error, "Couldn't update password"))
    }
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

        <Button onClick={handleUpdatePassword} disabled={!canSubmit || isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
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
