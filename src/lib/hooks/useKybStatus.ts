"use client"

import { useStore } from "@/lib/mock/store"

export function useKybStatus() {
  const kybStatus = useStore((s) => s.kybStatus)
  const setKybStatus = useStore((s) => s.setKybStatus)
  return { kybStatus, setKybStatus }
}
