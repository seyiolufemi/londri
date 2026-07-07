"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Minus, Plus, ShoppingCart, X } from "lucide-react"
import { useStore } from "@/lib/mock/store"
import { discoveryBusinesses } from "@/lib/mock/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

interface BusinessCartSectionProps {
  businessId: string
}

function BusinessCartSection({ businessId }: BusinessCartSectionProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)
  const items = useStore((s) => s.cart[businessId]) ?? []
  const priceListItems = useStore((s) => s.priceListItems)
  const updateCartItemQuantity = useStore((s) => s.updateCartItemQuantity)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const setCartSheetOpen = useStore((s) => s.setCartSheetOpen)

  const business = discoveryBusinesses.find((b) => b.id === businessId)
  const businessName = business?.name ?? "Unknown business"

  const rows = items
    .map((item) => {
      const priceListItem = priceListItems.find((p) => p.id === item.priceListItemId)
      if (!priceListItem) return null
      return { priceListItemId: item.priceListItemId, quantity: item.quantity, name: priceListItem.name, price: priceListItem.price }
    })
    .filter((r): r is { priceListItemId: string; quantity: number; name: string; price: number } => r !== null)

  const subtotal = rows.reduce((sum, r) => sum + r.price * r.quantity, 0)

  if (rows.length === 0) return null

  function handleCheckout() {
    setCartSheetOpen(false)
    router.push(`/checkout/${businessId}`)
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left">
        <span className="text-sm font-semibold text-foreground">{businessName}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-3 pb-4">
        {rows.map((row) => (
          <div key={row.priceListItemId} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
              <p className="text-xs text-muted-foreground">{formatNaira(row.price)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-border">
              <button
                type="button"
                onClick={() =>
                  updateCartItemQuantity(businessId, row.priceListItemId, row.quantity - 1)
                }
                className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-5 text-center text-sm tabular-nums">{row.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  updateCartItemQuantity(businessId, row.priceListItemId, row.quantity + 1)
                }
                className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3" />
              </button>
            </div>
            <span className="w-16 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
              {formatNaira(row.price * row.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeFromCart(businessId, row.priceListItemId)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatNaira(subtotal)}
          </span>
        </div>

        <Button className="mt-3 w-full" onClick={handleCheckout}>
          Checkout with {businessName}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const cart = useStore((s) => s.cart)
  const businessIds = Object.keys(cart).filter((id) => (cart[id]?.length ?? 0) > 0)
  const isEmpty = businessIds.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Your cart is empty</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground/70">
                Browse laundries near you and add items to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {businessIds.map((businessId) => (
                <BusinessCartSection key={businessId} businessId={businessId} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
