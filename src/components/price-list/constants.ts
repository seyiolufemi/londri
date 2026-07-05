// Real API values are Title Case ("Wash", "Iron", ...), not the lowercase enum
// the shared mock @/types#ServiceType uses — so this is its own local type.
// "Dry Clean" is inferred from the naming pattern; only "Wash" and "Iron" are
// confirmed from a real response so far.
export const ALL_SERVICE_TYPES = ["Wash", "Dry Clean", "Iron"] as const
export type PriceListServiceType = (typeof ALL_SERVICE_TYPES)[number]

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}
