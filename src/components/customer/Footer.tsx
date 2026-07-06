import Link from "next/link"

const LINKS = [
  { label: "About Us", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "For Businesses", href: "/business" },
  { label: "Terms and Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
]

export default function Footer() {
  return (
    <footer className="relative h-[480px] overflow-hidden bg-primary">
      {/*
        Decorative washing-machine illustrations (with their laundry items).
        The 1440px frame sits at the footer's top so the SVGs' transparent upper
        region falls behind the centered logo/links; the items + machines emerge
        just below the links and the footer's fixed height crops the bottom —
        same technique as the hero. Promoted to its own layer for scroll perf.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full">
        <div className="relative mx-auto h-[855px] w-[1440px] transform-gpu">
          {/* Back layer — navy */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-03-navy.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[79px] top-0 h-[855px] w-[753px]"
          />
          {/* Middle layer — plum */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-09-plum.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[344px] top-0 h-[855px] w-[753px]"
          />
          {/* Front layer — sage */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/washing-machines/variant-04-sage.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[609px] top-0 h-[855px] w-[753px]"
          />
        </div>
      </div>

      {/* Top content — sits above the illustrations */}
      <div className="relative z-10 mx-auto flex max-w-[1092px] flex-col items-center gap-[42px] px-8 pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo+wordmark-white.png" alt="Londri" className="h-auto w-[148px]" />
        <nav className="flex items-center gap-[31px]">
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
    </footer>
  )
}
