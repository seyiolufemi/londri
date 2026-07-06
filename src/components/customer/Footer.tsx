"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "For Businesses", href: "/business" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
]

export default function Footer() {
  return (
    // bg-primary stays static (not animated) — only the content below fades in.
    // Fading the background too made it visible through the page's white
    // background during the transition, reading as a white flash.
    <footer className="relative overflow-hidden bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      {/* Top content — normal flow, so its height is whatever it needs at each breakpoint */}
      <div className="relative z-10 mx-auto flex max-w-[1092px] flex-col items-center gap-6 px-8 pt-10 sm:gap-8 md:gap-[42px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo+wordmark-white.png" alt="Londri" className="h-auto w-[148px]" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-[31px]">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-normal text-white transition-colors hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/*
        Decorative washing-machine illustrations (with their laundry items) — a
        normal-flow sibling BELOW the content above, not absolutely overlaid
        behind it. It used to be absolutely positioned to fill the footer from
        y:0, relying on the SVGs' own blank margin above the laundry items to
        "cover" the content's height — that only worked at desktop scale; the
        blank margin shrinks with the illustration's scale factor much faster
        than the (unscaled) text content does, so at mobile scale factors the
        content collided with the illustrated items. Normal flow makes that
        collision structurally impossible at any breakpoint.

        The 1440x855 composition is scaled as a single unit via CSS transform
        — same technique as the hero — so every child's fixed px position/size
        scales together and stays proportionally correct. Centered with
        `left-1/2 -translate-x-1/2` rather than `mx-auto`, since browsers
        left-align (rather than center) an `mx-auto` box wider than its
        container — see the matching comment in the hero for the full
        explanation. Each image is shifted up 100px (unscaled) to skip most of
        the blank canvas above the laundry items, so even a short mobile crop
        window shows the items rather than empty space.
      */}
      <div className="relative mt-6 h-[130px] overflow-hidden sm:mt-8 sm:h-[165px] md:mt-10 md:h-[230px] lg:mt-12 lg:h-[340px]">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div className="relative left-1/2 h-[855px] w-[1440px] origin-top -translate-x-1/2 scale-[0.4] transform-gpu sm:scale-[0.5] md:scale-[0.7] lg:scale-100">
            {/* Back layer — navy */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/washing-machines/variant-03-navy.svg"
              alt=""
              aria-hidden="true"
              className="absolute left-[79px] top-[-100px] h-[855px] w-[753px]"
            />
            {/* Middle layer — plum */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/washing-machines/variant-09-plum.svg"
              alt=""
              aria-hidden="true"
              className="absolute left-[344px] top-[-100px] h-[855px] w-[753px]"
            />
            {/* Front layer — sage */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/washing-machines/variant-04-sage.svg"
              alt=""
              aria-hidden="true"
              className="absolute left-[609px] top-[-100px] h-[855px] w-[753px]"
            />
          </div>
        </div>
      </div>
      </motion.div>
    </footer>
  )
}
