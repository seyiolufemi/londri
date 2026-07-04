import type { ServiceType } from "@/types"

export const ALL_SERVICE_TYPES: ServiceType[] = ["wash", "dry_clean", "iron"]

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}
