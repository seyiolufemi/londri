"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  LayoutDashboard,
  ClipboardList,
  Tag,
  RefreshCw,
  ArrowLeftRight,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/mock/store"
import { useLogoutMutation } from "@/redux/api/authApi"
import { getApiErrorMessage } from "@/lib/apiError"
import type { KybStatus } from "@/types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  kybStatus: KybStatus
}

interface NavEntry {
  label: string
  icon: LucideIcon
  href: string
}

const MAIN_NAV: NavEntry[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/overview" },
  { label: "Orders", icon: ClipboardList, href: "/orders" },
  { label: "Price List", icon: Tag, href: "/price-list" },
  { label: "Subscriptions", icon: RefreshCw, href: "/subscriptions" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/transactions" },
]

const BOTTOM_NAV: NavEntry[] = [
  { label: "Profile", icon: UserCircle, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
]

const KYB_PILL: Partial<Record<KybStatus, { label: string; className: string }>> = {
  pending: { label: "Pending Review", className: "bg-amber-50 text-amber-600" },
  under_review: { label: "Under Review", className: "bg-blue-50 text-blue-600" },
  rejected: { label: "Action Required", className: "bg-destructive/10 text-destructive" },
}

// Inline label that animates in/out with the sidebar width — never unmounts
function SlideLabel({
  children,
  collapsed,
  className,
}: {
  children: React.ReactNode
  collapsed: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out",
        collapsed ? "ml-0 w-0 opacity-0" : "ml-3 opacity-100",
        className
      )}
    >
      {children}
    </span>
  )
}

function NavItem({
  label,
  icon: Icon,
  href,
  collapsed,
  active,
}: {
  label: string
  icon: LucideIcon
  href: string
  collapsed: boolean
  active: boolean
}) {
  const inner = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-lg p-2.5 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <SlideLabel collapsed={collapsed}>{label}</SlideLabel>
    </Link>
  )

  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ) : (
    inner
  )
}

export default function Sidebar({ collapsed, onToggle, kybStatus }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const businessName =
    useStore((s) => s.signupData.businessName) || "Sparkle Wash Laundry"
  const initials = businessName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()

  const kybPill = kybStatus !== "approved" ? KYB_PILL[kybStatus] : null

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      setShowLogoutConfirm(false)
      router.push("/login")
    } catch (error) {
      toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't log out. Please try again."))
    }
  }

  // Sign out — rendered once; label animates with sidebar
  const signOutContent = (
    <div
      onClick={() => setShowLogoutConfirm(true)}
      className="group flex cursor-pointer items-center rounded-lg p-2.5 hover:bg-destructive/10"
    >
      <LogOut className="size-[18px] shrink-0 text-muted-foreground group-hover:text-destructive" />
      <SlideLabel
        collapsed={collapsed}
        className="text-sm text-muted-foreground group-hover:text-destructive"
      >
        Sign out
      </SlideLabel>
    </div>
  )

  return (
    /*
     * Outer div: owns the width transition and positions the toggle button.
     * The inner <aside> has overflow-hidden so content clips cleanly as
     * the width changes — but the toggle button (a sibling of aside) is
     * never clipped.
     */
    <div
      className={cn(
        "relative h-full flex-shrink-0 transition-all duration-200 ease-in-out",
        collapsed ? "w-[60px]" : "w-60"
      )}
    >
      <aside className="flex h-full w-full flex-col overflow-hidden border-r border-border bg-background">
        {/* Logo — both images always in DOM, cross-fade on collapse */}
        <div className="relative px-4 py-5">
          <img
            src="/logo+wordmark-teal.png"
            alt="Londri"
            className={cn(
              "h-7 w-auto transition-opacity duration-200 ease-in-out",
              collapsed ? "opacity-0" : "opacity-100"
            )}
          />
          <img
            src="/logo-teal.svg"
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute left-4 top-5 h-7 w-7 object-contain transition-opacity duration-200 ease-in-out",
              collapsed ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 pt-6">
          {MAIN_NAV.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={pathname === item.href}
            />
          ))}

          <div className="my-2 border-t border-border" />

          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-border px-2.5 py-3">
          {/* Business name + KYB pill — avatar always visible, text slides */}
          <div className="flex items-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out",
                collapsed ? "ml-0 w-0 opacity-0" : "ml-3 flex-1 opacity-100"
              )}
            >
              <p className="truncate whitespace-nowrap text-sm font-medium text-foreground">
                {businessName}
              </p>
              {kybPill && (
                <span
                  className={cn(
                    "mt-1.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
                    kybPill.className
                  )}
                >
                  {kybPill.label}
                </span>
              )}
            </div>
          </div>

          <div className="my-3 border-t border-border" />

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{signOutContent}</TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            signOutContent
          )}
        </div>
      </aside>

      {/*
       * Toggle button lives outside <aside> so overflow-hidden never clips it.
       * top-[34px] = py-5 (20px) + half of h-7 (14px) — centers on the logo row.
       */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[34px] flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="size-3 text-muted-foreground" />
        )}
      </button>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut && <Loader2 className="size-4 animate-spin" />}
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
