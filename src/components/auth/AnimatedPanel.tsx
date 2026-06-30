"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const CONTENT = [
  {
    headline: ["Run your laundry", "professionally."],
    subtitle:
      "Manage orders, collect payments, and keep customers updated — all in one place.",
  },
  {
    headline: ["Get paid faster,", "every single time."],
    subtitle:
      "Accept payments online and at the counter with zero friction for your customers.",
  },
  {
    headline: ["Turn first-timers", "into loyal fans."],
    subtitle:
      "Automated WhatsApp updates and flexible subscription plans that keep customers coming back.",
  },
]

const CIRCUMFERENCE = 2 * Math.PI * 32 // ~201.06

interface PanelState {
  index: number
  visible: boolean
  cycleKey: number
}

export default function AnimatedPanel() {
  const [state, setState] = useState<PanelState>({
    index: 0,
    visible: true,
    cycleKey: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade text out and reset ring simultaneously
      setState((prev) => ({ ...prev, visible: false, cycleKey: prev.cycleKey + 1 }))

      // After text fade completes: swap content and fade back in
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          index: (prev.index + 1) % CONTENT.length,
          visible: true,
        }))
      }, 300)
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-primary">
      {/* Static diagonal lines */}
      <div className="absolute inset-0 [background-image:repeating-linear-gradient(135deg,transparent,transparent_34px,rgb(255_255_255_/_0.04)_34px,rgb(255_255_255_/_0.04)_74px)]" />

      <div className="relative flex flex-col items-center gap-8 px-12">
        {/* Progress ring */}
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          {/* Track */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="12"
          />
          {/* Progress — key change remounts element, restarting the CSS animation */}
          <circle
            key={state.cycleKey}
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            className="progress-ring"
            transform="rotate(-90, 40, 40)"
          />
        </svg>

        {/* Text block — fades on content swap, fixed height prevents layout shift */}
        <motion.div
          className="flex h-56 flex-col items-center justify-center"
          animate={{ opacity: state.visible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-center font-[family-name:var(--font-jakarta)] text-5xl font-bold leading-tight text-white">
            {CONTENT[state.index].headline[0]}
            <br />
            {CONTENT[state.index].headline[1]}
          </h2>
          <p className="mt-3 max-w-xs text-center text-sm text-white/70">
            {CONTENT[state.index].subtitle}
          </p>
        </motion.div>

        {/* Dot indicators — always visible */}
        <div className="flex items-center gap-2">
          {CONTENT.map((_, i) => (
            <motion.div
              key={i}
              layout
              className="h-1.5 rounded-full"
              animate={{
                width: i === state.index ? 24 : 6,
                backgroundColor:
                  i === state.index
                    ? "rgba(255,255,255,1)"
                    : "rgba(255,255,255,0.3)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
