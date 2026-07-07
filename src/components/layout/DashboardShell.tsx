"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Clock } from "lucide-react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { useGetMeQuery } from "@/redux/api/authApi"
import { toKybStatus } from "@/lib/kybStatus"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { data: business, isLoading: businessLoading } = useGetMyBusinessQuery()
  const kybStatus = toKybStatus(business?.current_kyb_status, businessLoading)
  // Fetched here (not just on the profile page) so it's cached and available
  // app-wide as soon as the owner enters the dashboard after login.
  useGetMeQuery()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        kybStatus={kybStatus}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {kybStatus !== "approved" && (
          <div
            className={
              kybStatus === "rejected"
                ? "flex w-full items-center justify-between bg-destructive/10 px-8 py-3 text-sm text-destructive"
                : "flex w-full items-center justify-between bg-amber-50 px-8 py-3 text-sm text-amber-700"
            }
          >
            <span className="flex items-center">
              {kybStatus === "rejected" ? (
                <AlertCircle className="mr-2 size-[14px] shrink-0" />
              ) : (
                <Clock className="mr-2 size-[14px] shrink-0" />
              )}
              {kybStatus === "rejected"
                ? "Verification unsuccessful. Please review and resubmit your documents."
                : "Your account is under review. Some features are limited until verification is complete."}
            </span>
            {kybStatus === "rejected" ? (
              <span
                className="cursor-pointer text-xs font-medium text-destructive underline"
                onClick={() => router.push("/kyb")}
              >
                Resubmit now →
              </span>
            ) : (
              <span className="text-xs text-amber-600">Usually takes under 48 hours</span>
            )}
          </div>
        )}

        <Header />

        <main className="flex-1 overflow-y-auto bg-muted/30 p-8">{children}</main>
      </div>
    </div>
  )
}
