import type { Metadata } from "next"
import DashboardShell from "@/components/layout/DashboardShell"

export const metadata: Metadata = {
  title: {
    default: "Londri Business",
    template: "%s | Londri Business",
  },
  description:
    "Manage your laundry business — orders, payments, pricing, and more, all in one dashboard.",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
