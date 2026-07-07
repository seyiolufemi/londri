"use client"

import { useEffect, useState } from "react"

export interface GeolocationCoords {
  latitude: number
  longitude: number
}

type GeolocationStatus = "loading" | "granted" | "denied" | "unavailable"

interface GeolocationState {
  coords: GeolocationCoords | null
  status: GeolocationStatus
}

function getInitialStatus(): GeolocationStatus {
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unavailable"
  return "loading"
}

// Requests the browser's current position once on mount. Falls back to
// "denied"/"unavailable" rather than throwing — callers should have their own
// fallback display for when real coords aren't available (permission denied,
// unsupported browser, or SSR).
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => ({
    coords: null,
    status: getInitialStatus(),
  }))

  useEffect(() => {
    if (state.status !== "loading") return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          status: "granted",
        })
      },
      () => setState({ coords: null, status: "denied" }),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
  }, [state.status])

  return state
}
