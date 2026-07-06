"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Navbar from "@/components/customer/Navbar"
import { Button } from "@/components/ui/button"

export default function BusinessPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Navbar hideCart />

      {/* ── Hero (teal block) — same visual treatment as the customer landing hero ── */}
      <div className="relative overflow-hidden bg-primary">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/pattern-bg-hero.png')] bg-cover bg-center opacity-25"
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative z-10 mx-auto max-w-[1092px] px-8">
            <h1 className="mx-auto mt-16 max-w-[905px] text-center font-[family-name:var(--font-space-grotesk)] text-3xl font-bold leading-[1.084] tracking-[-2.22px] text-white sm:mt-20 sm:text-4xl md:mt-24 md:text-5xl lg:mt-32 lg:text-6xl xl:text-[74px]">
              Run your laundry business like a real business.
            </h1>

            <p className="mx-auto mt-6 max-w-[280px] text-center font-sans text-base leading-[1.4] text-white sm:max-w-[420px] md:max-w-[480px] md:text-lg">
              Manage orders, collect payments, and keep customers updated — all from one dashboard.
            </p>

            <div className="mt-8 flex justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/signup">Get your business online</Link>
              </Button>
            </div>
          </div>

          {/* Washing machine illustrations — same staggered composition/scaling technique as the customer hero */}
          <div className="relative z-10 mt-8 h-[175px] overflow-x-clip overflow-y-hidden sm:h-[215px] md:h-[290px] lg:h-[388px]">
            <div className="pointer-events-none relative left-1/2 h-full w-[1440px] origin-top -translate-x-1/2 scale-[0.45] transform-gpu sm:scale-[0.55] md:scale-[0.75] lg:scale-100">
              {/* Back layer — mustard */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/washing-machines/variant-05-mustard-hero.svg"
                alt=""
                aria-hidden="true"
                className="absolute left-[140.77px] top-[-230px] h-[767px] w-[675.69px]"
              />
              {/* Middle layer — rose */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/washing-machines/variant-06-rose-hero.svg"
                alt=""
                aria-hidden="true"
                className="absolute left-[344.09px] top-[-230px] h-[767px] w-[675.69px]"
              />
              {/* Front layer — charcoal */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/washing-machines/variant-07-charcoal-hero.svg"
                alt=""
                aria-hidden="true"
                className="absolute left-[542.54px] top-[-230px] h-[767px] w-[675.69px]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
