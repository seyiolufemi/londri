"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { useStore } from "@/lib/mock/store"
import CartSheet from "@/components/customer/CartSheet"

interface NavbarProps {
  hideCart?: boolean
}

// Hamburger bars morph into an X via rotate/translate — no icon swap, so it
// reads as one continuous shape animating rather than a cross-fade.
function MenuToggle({ open }: { open: boolean }) {
  return (
    <div className="relative flex size-[22px] items-center justify-center">
      <motion.span
        className="absolute h-[2px] w-[18px] rounded-full bg-white"
        animate={{ rotate: open ? 45 : 0, y: open ? 0 : -5 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute h-[2px] w-[18px] rounded-full bg-white"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className="absolute h-[2px] w-[18px] rounded-full bg-white"
        animate={{ rotate: open ? -45 : 0, y: open ? 0 : 5 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
    </div>
  )
}

export default function Navbar({ hideCart = false }: NavbarProps) {
  // Shared via the store (not local state) so other pages — e.g. the business
  // detail page's sticky "View Cart" bar — can open this same CartSheet
  // instance without each page needing to mount its own.
  const cartOpen = useStore((s) => s.cartSheetOpen)
  const setCartOpen = useStore((s) => s.setCartSheetOpen)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useStore((s) => s.getCartItemCount())
  const isAuthenticated = useStore((s) => s.customerAuth.isAuthenticated)
  const accountHref = isAuthenticated ? "/account/orders" : "/account/login"
  const accountLabel = isAuthenticated ? "My Orders" : "Sign In"

  return (
    <div className="sticky top-0 z-50 bg-primary">
      {/* Pattern overlay — matches the hero's texture so the navbar reads as one continuous block */}
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/pattern-bg-hero.png')] bg-cover bg-center opacity-25"
        aria-hidden="true"
      />

      <nav className="relative z-30 mx-auto flex max-w-[1092px] items-center justify-between px-8 py-6">
        {/* Left group: logo + For Businesses (desktop only — moves into the mobile menu below md) */}
        <div className="flex items-center gap-16">
          <Link href="/" className="cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo+wordmark-white.png" alt="Londri" className="h-7 w-auto" />
          </Link>
          <Link
            href="/business"
            className="hidden cursor-pointer text-sm text-white/90 transition-colors hover:text-white md:block"
          >
            For Businesses
          </Link>
        </div>

        {/* Right: Sign In / My Orders (desktop only), cart, plus hamburger on mobile */}
        <div className="flex items-center gap-4">
          <Link
            href={accountHref}
            className="hidden cursor-pointer text-sm text-white/90 transition-colors hover:text-white md:block"
          >
            {accountLabel}
          </Link>

          {!hideCart && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative cursor-pointer"
            >
              <ShoppingCart className="size-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="cursor-pointer md:hidden"
          >
            <MenuToggle open={mobileMenuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — a dropdown anchored to the nav's own bottom edge
          (top-full against this sticky container, whose height is the nav
          row's height) rather than a Sheet overlaying from the viewport top,
          so it extends from below the nav instead of covering it. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-menu-overlay"
              className="absolute inset-x-0 top-full z-10 h-screen bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="mobile-menu-panel"
              className="absolute inset-x-0 top-full z-20 overflow-hidden bg-primary shadow-lg md:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="px-8 pb-6 pt-2">
                <Link
                  href="/business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-lg font-medium text-white"
                >
                  For Businesses
                </Link>
                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-lg font-medium text-white"
                >
                  {accountLabel}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!hideCart && <CartSheet open={cartOpen} onOpenChange={setCartOpen} />}
    </div>
  )
}
