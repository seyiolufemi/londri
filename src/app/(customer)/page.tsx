"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import HeroSearch from "@/components/customer/HeroSearch"
import BusinessCard from "@/components/customer/BusinessCard"
import Footer from "@/components/customer/Footer"
import { Button } from "@/components/ui/button"
import { discoveryBusinesses } from "@/lib/mock/data"

export default function CustomerLandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Navbar />

      {/*
        ── Hero (teal block) ──
        The bg-primary color and pattern overlay stay static (not animated) —
        only the content (headline/subtitle/search/illustrations) fades in via
        the motion.div below. Fading the background too made it visible
        through the transparent page background during the transition, reading
        as a white flash. The navbar itself lives in its own always-visible
        Navbar component above, not inside this fade-in wrapper, since nav
        should be immediately usable rather than scroll/mount-revealed.

        overflow-hidden below is load-bearing, not decorative: the headline's
        responsive mt-* margin would otherwise collapse through this div (and
        its motion.div/content-container descendants, none of which have
        padding/border to stop it) and escape above the hero entirely, leaving
        a gap of exposed page background between the navbar and the hero.
        overflow-hidden establishes a new block formatting context that
        contains the margin instead.
      */}
      <div className="relative overflow-hidden bg-primary">
      {/* Pattern overlay — its own layer so opacity fades the texture only, not the primary color or content */}
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/pattern-bg-hero.png')] bg-cover bg-center opacity-25"
        aria-hidden="true"
      />
      {/* Content — fades in on mount since it's above the fold */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      {/* Content container — hero copy, centered at 1092px */}
      <div className="relative z-10 mx-auto max-w-[1092px] px-8">
        {/* Headline */}
        <h1 className="mx-auto mt-16 max-w-[905px] text-center font-[family-name:var(--font-space-grotesk)] text-3xl font-bold leading-[1.084] tracking-[-2.22px] text-white sm:mt-20 sm:text-4xl md:mt-24 md:text-5xl lg:mt-32 lg:text-6xl xl:text-[74px]">
          Finding laundry services near you just got easier.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-[280px] text-center font-sans text-base leading-[1.4] text-white sm:max-w-[360px] md:max-w-[420px] md:text-lg">
          Discover trusted laundries nearby, book in seconds, and follow every step easily.
        </p>

        {/* Search bar */}
        <div className="mt-8">
          <HeroSearch />
        </div>
      </div>

      {/*
        Washing machine illustrations — the 1440x767 desktop composition is scaled
        as a single unit via CSS transform rather than rewritten per breakpoint, so
        every child's fixed px position/size scales together and stays
        proportionally correct. transform-gpu (rather than a raw
        `[transform:translateZ(0)]` arbitrary value) composes with the scale-*
        utilities below while still promoting the layer for scroll compositing.
        Centering uses `left-1/2 -translate-x-1/2` rather than `mx-auto`: browsers
        resolve `margin: 0 auto` on a box WIDER than its container by clamping
        margin-left to 0 and dumping all the overflow into margin-right, which
        left-aligns the box instead of centering it — a real, easy-to-miss
        Chromium/CSS behavior for any container narrower than the fixed 1440px
        frame (every breakpoint below "lg", plus even "lg" viewports narrower
        than 1440px). The left-1/2/-translate-x-1/2 pairing centers correctly at
        any container width and composes cleanly with the scale transform.
        The crop window height scales alongside the composition so roughly the
        same band (body, control panel, door/drum) stays visible at every
        breakpoint. On mobile the composition intentionally overflows the
        viewport width slightly — clipped by overflow-x-clip — rather than
        shrinking the illustrations below a readable size.
      */}
      <div className="relative z-10 mt-8 h-[175px] overflow-x-clip overflow-y-hidden sm:h-[215px] md:h-[290px] lg:h-[388px]">
        <div className="pointer-events-none relative left-1/2 h-full w-[1440px] origin-top -translate-x-1/2 scale-[0.45] transform-gpu sm:scale-[0.55] md:scale-[0.75] lg:scale-100">
          {/* Back layer — coral */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-02-coral-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[140.77px] top-[-230px] h-[767px] w-[675.69px]"
          />
          {/* Middle layer — white */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-01-white-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[344.09px] top-[-230px] h-[767px] w-[675.69px]"
          />
          {/* Front layer — sky blue */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-08-skyblue-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[542.54px] top-[-230px] h-[767px] w-[675.69px]"
          />
        </div>
      </div>
      </motion.div>
      </div>

      {/* ── Discovery preview: "Laundries near you" ── */}
      <motion.section
        className="mx-auto max-w-[1092px] px-8 py-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="mb-8 text-center font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground md:text-4xl lg:text-[48px]">
          Laundries near you
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {discoveryBusinesses.slice(0, 6).map((business, index) => (
            <BusinessCard key={business.id} business={business} index={index} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/discover">
              View all laundries
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
