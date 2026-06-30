"use client"

import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

const PATH_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/orders": "Orders",
  "/price-list": "Price List",
  "/subscriptions": "Subscription Plans",
  "/transactions": "Transactions",
  "/settings": "Settings",
  "/walk-in": "New Walk-in Order",
}

function toTitle(pathname: string): string {
  const exact = PATH_TITLES[pathname]
  if (exact) return exact
  const segments = pathname.split("/").filter(Boolean)
  const last = segments[segments.length - 1] ?? ""
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-8 py-4">
      <h1 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
        {toTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-[18px]" />
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
        </Button>

      </div>
    </header>
  )
}
