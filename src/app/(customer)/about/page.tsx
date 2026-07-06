import Navbar from "@/components/customer/Navbar"
import Footer from "@/components/customer/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-primary">
      <Navbar />

      {/* Pattern overlay — same treatment as the hero sections */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/pattern-bg-hero.png')] bg-cover bg-center opacity-25"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl px-6 py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-01-white.svg"
            alt=""
            aria-hidden="true"
            className="mx-auto h-40 w-auto object-contain opacity-90 sm:h-48"
          />

          <h1 className="mt-6 text-center font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white md:text-4xl">
            Laundry businesses deserve better tools.
          </h1>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-white/85 md:text-lg">
            <p>
              Most laundry businesses in Nigeria run on WhatsApp threads, paper receipts, and memory.
              Orders get missed, payments get lost in chat history, and there&apos;s no easy way for a
              customer to know if their laundry is ready. Londri started with a simple question: what
              if running a laundry business felt as organized as running any other business?
            </p>
            <p>
              We built Londri to give laundry owners a real dashboard — one place to see every order,
              track payments, and update customers automatically — without needing a developer or a new
              habit to learn. On the customer side, finding a trusted laundry nearby, seeing clear
              pricing, and booking a pickup should take seconds, not a back-and-forth over chat.
            </p>
            <p>
              We&apos;re just getting started, but the goal doesn&apos;t change: give every laundry
              business, no matter how small, the same tools the big players take for granted — and give
              their customers a better way to get their laundry done.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
