import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import HeroSearch from "@/components/customer/HeroSearch"
import BusinessCard from "@/components/customer/BusinessCard"
import Footer from "@/components/customer/Footer"
import { Button } from "@/components/ui/button"
import { discoveryBusinesses } from "@/lib/mock/data"

interface CustomerLandingPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CustomerLandingPage({ searchParams }: CustomerLandingPageProps) {
  // The Nomba checkout's default return URL points at the site root — the
  // payment gateway has no way to know this is an owner-dashboard app, so we
  // catch its redirect here and route the owner to a confirmation screen
  // (the gateway sends the owner back here on failure/cancel too, so we
  // can't just assume success from the redirect alone).
  const { orderId } = await searchParams
  if (orderId) {
    redirect(`/orders/callback?orderId=${orderId}`)
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {/* ── Hero (teal block) ── */}
      <div className="bg-primary">
      {/* Content container — navbar + hero copy, centered at 1092px */}
      <div className="relative mx-auto max-w-[1092px] px-8">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo+wordmark-white.png" alt="Londri" className="h-7 w-auto" />
          <Link
            href="/business"
            className="cursor-pointer text-sm text-white/90 transition-colors hover:text-white"
          >
            For Businesses
          </Link>
        </nav>

        {/* Headline */}
        <h1 className="mx-auto mt-32 max-w-[905px] text-center font-[family-name:var(--font-space-grotesk)] text-[74px] font-bold leading-[1.084] tracking-[-2.22px] text-white">
          Finding laundry services near you just got easier.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-[420px] text-center font-sans text-[18px] leading-[1.4] text-white">
          Discover trusted laundries nearby, book in seconds, and follow every step easily.
        </p>

        {/* Search bar */}
        <div className="mt-8">
          <HeroSearch />
        </div>
      </div>

      {/*
        Washing machine illustrations — positioned against a 1440px reference frame.
        The prop-free -hero SVGs still carry ~304px of transparent space above the
        machine body (body starts at viewBox y=250 → ~304px at the 767px render), so
        each image is pulled up 230px. The 388px overflow-hidden container then shows
        the band containing the body, control panel and door/drum, while the lower
        door and feet are cut below the hero's bottom edge. The inner wrapper is
        promoted to its own compositor layer (translateZ) so the large SVGs composite
        instead of repainting on scroll.
      */}
      <div className="relative mt-8 h-[388px] overflow-x-clip overflow-y-hidden">
        <div className="pointer-events-none relative mx-auto h-full w-[1440px] [transform:translateZ(0)]">
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
      </div>

      {/* ── Discovery preview: "Laundries near you" ── */}
      <section className="mx-auto max-w-[1092px] px-8 py-16">
        <h2 className="mb-8 text-center font-[family-name:var(--font-space-grotesk)] text-[48px] font-bold text-foreground">
          Laundries near you
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {discoveryBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
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
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
