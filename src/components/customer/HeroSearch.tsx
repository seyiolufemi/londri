"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const PHRASES = [
  "Search for 'Lekki'",
  "Search for 'Dry Clean'",
  "Search for 'Native Wear'",
  "Search for 'Shirts'",
  "Search for 'Ikeja'",
  "Search for 'Wash & Iron'",
]

const TYPE_MS = 50
const ERASE_MS = 30
const HOLD_MS = 1500
const BETWEEN_MS = 300

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [animated, setAnimated] = useState("")

  // Animate only when the field is idle: not focused and no user input.
  const animating = !focused && query === ""

  useEffect(() => {
    if (!animating) return

    let phraseIdx = 0
    let charIdx = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const run = () => {
      const full = PHRASES[phraseIdx] ?? ""
      if (!deleting) {
        charIdx++
        setAnimated(full.slice(0, charIdx))
        if (charIdx === full.length) {
          deleting = true
          timer = setTimeout(run, HOLD_MS)
        } else {
          timer = setTimeout(run, TYPE_MS)
        }
      } else {
        charIdx--
        setAnimated(full.slice(0, charIdx))
        if (charIdx === 0) {
          deleting = false
          phraseIdx = (phraseIdx + 1) % PHRASES.length
          timer = setTimeout(run, BETWEEN_MS)
        } else {
          timer = setTimeout(run, ERASE_MS)
        }
      }
    }

    timer = setTimeout(run, TYPE_MS)
    return () => clearTimeout(timer)
  }, [animating])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/discover?q=${encodeURIComponent(trimmed)}` : "/discover")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-[50px] w-full max-w-[517px] items-center rounded-full border border-[color-mix(in_oklch,var(--primary)_82%,white)] bg-[color-mix(in_oklch,var(--primary)_92%,white)] p-[5px] sm:h-[55px]"
    >
      <Input
        value={animating ? animated : query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-full flex-1 border-none bg-transparent pl-4 text-[15px] text-white shadow-none placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        type="submit"
        aria-label="Search"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white p-0 text-primary hover:bg-white/90 sm:size-[45px]"
      >
        <Search className="size-4 sm:size-[18px]" />
      </Button>
    </form>
  )
}
