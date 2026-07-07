import type { GeolocationCoords } from "@/lib/hooks/useGeolocation"
import type { OperatingDay, ServiceType } from "@/types"

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

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

// Fallback only — used when we don't have the customer's real location yet
// (permission denied/unavailable/still loading). Prefer getDistanceKm below.
export function pickDistanceKm(id: string): number {
  const km = 0.5 + (hashSeed(id + "distance") % 95) / 10
  return Math.round(km * 10) / 10
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

// Great-circle (Haversine) distance between two lat/lng points, in km.
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

// Real distance from the customer's location when available, otherwise the
// stable per-business fallback.
export function getDistanceKm(
  business: { id: string; latitude: number; longitude: number },
  customerCoords: GeolocationCoords | null
): number {
  if (!customerCoords) return pickDistanceKm(business.id)
  const km = haversineDistanceKm(
    customerCoords.latitude,
    customerCoords.longitude,
    business.latitude,
    business.longitude
  )
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

// No operating-hours data on the business detail response yet — every day
// runs 8am–8pm except one deterministically "closed" day per business.
export function pickOperatingHours(id: string): Record<string, OperatingDay> {
  const closedDayIndex = hashSeed(id + "closed") % WEEK_DAYS.length
  const hours: Record<string, OperatingDay> = {}
  WEEK_DAYS.forEach((day, i) => {
    hours[day] =
      i === closedDayIndex
        ? { open: false, openTime: "", closeTime: "" }
        : { open: true, openTime: "08:00", closeTime: "20:00" }
  })
  return hours
}
