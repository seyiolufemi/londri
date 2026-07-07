import type { ServiceType } from "@/types"

export const ALL_SERVICE_TYPES: ServiceType[] = ["wash", "dry_clean", "iron"]

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

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

// No backend data for illustration/distance/open-status/service tags/price yet —
// derived deterministically from the business id (stable per business, not
// re-randomized on every render, and shared between the card display and the
// discover page's filter/sort so both agree on the same values).
function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = ((h << 5) - h + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function pickIllustration(id: string): string {
  return ILLUSTRATION_VARIANTS[hashSeed(id) % ILLUSTRATION_VARIANTS.length]
}

export function pickDistanceKm(id: string): number {
  const km = 0.5 + (hashSeed(id + "distance") % 95) / 10
  return Math.round(km * 10) / 10
}

export function pickIsOpen(id: string): boolean {
  return hashSeed(id + "open") % 10 < 8
}

export function pickServiceTypes(id: string): ServiceType[] {
  const count = 1 + (hashSeed(id + "count") % 3)
  const start = hashSeed(id + "start") % ALL_SERVICE_TYPES.length
  return Array.from({ length: count }, (_, i) => ALL_SERVICE_TYPES[(start + i) % ALL_SERVICE_TYPES.length])
}

export function pickCheapestPrice(id: string): number {
  return 300 + (hashSeed(id + "price") % 35) * 50
}
