import type { KybStatus } from "@/types"

// Backend only confirmed to return "verified" for the success case so far;
// "rejected" is inferred from naming, everything else (including "pending"/
// "under_review", or not yet loaded) buckets to "pending".
export function toKybStatus(current: string | undefined, isLoading: boolean): KybStatus {
  if (isLoading || current === undefined) return "approved"
  if (current === "verified") return "approved"
  if (current === "rejected") return "rejected"
  return "pending"
}
