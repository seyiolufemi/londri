import { useEffect, useRef, useState } from "react"
import { Minus, Plus, Search, X } from "lucide-react"
import type { PriceListItem } from "@/redux/api/catalogApi"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export interface AddedItem {
  priceListItemId: string
  name: string
  categoryId: string
  quantity: number
  unitPrice: number
}

interface ItemPickerSectionProps {
  items: PriceListItem[]
  isLoading: boolean
  categoryNameById: Record<string, string>
  addedItems: AddedItem[]
  eligibleCategoryNames: string[]
  hasActiveSubscription: boolean
  totalAmount: number
  error?: string
  onAddItem: (item: PriceListItem) => void
  onRemoveItem: (priceListItemId: string) => void
  onUpdateQuantity: (priceListItemId: string, delta: number) => void
}

export default function ItemPickerSection({
  items,
  isLoading,
  categoryNameById,
  addedItems,
  eligibleCategoryNames,
  hasActiveSubscription,
  totalAmount,
  error,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
}: ItemPickerSectionProps) {
  const [itemSearch, setItemSearch] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const filteredItems = itemSearch.trim()
    ? items.filter((i) => {
        const q = itemSearch.toLowerCase()
        return (
          i.name.toLowerCase().includes(q) ||
          (categoryNameById[i.category_id] ?? "").toLowerCase().includes(q)
        )
      })
    : items

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleAdd(item: PriceListItem) {
    onAddItem(item)
    setItemSearch("")
    setPickerOpen(false)
  }

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Items &amp; Pricing</h3>

      {/* Item picker */}
      {isLoading ? (
        <Skeleton className="mb-4 h-10 w-full rounded-md" />
      ) : (
        <div ref={pickerRef} className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items to add…"
              className={cn("pl-9", error && "border-destructive")}
              value={itemSearch}
              onFocus={() => setPickerOpen(true)}
              onChange={(e) => {
                setItemSearch(e.target.value)
                setPickerOpen(true)
              }}
            />
          </div>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

          {pickerOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
              {filteredItems.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  {items.length === 0 ? "No items in your price list yet" : "No items found"}
                </p>
              ) : (
                filteredItems.map((item) => {
                  const alreadyAdded = addedItems.some((a) => a.priceListItemId === item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAdd(item)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted",
                        alreadyAdded && "opacity-50"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryNameById[item.category_id] ?? "Uncategorized"}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {formatNaira(item.price)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Added items list */}
      {addedItems.length > 0 && (
        <div className="mb-3">
          {addedItems.map((item) => {
            const categoryName = categoryNameById[item.categoryId] ?? item.categoryId
            const notCovered =
              hasActiveSubscription &&
              eligibleCategoryNames.length > 0 &&
              !eligibleCategoryNames.includes(categoryName)
            return (
              <div
                key={item.priceListItemId}
                className="flex items-center justify-between border-b border-border py-2 last:border-0"
              >
                {/* Left: name + category */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryName}</p>
                  {notCovered && (
                    <p className="text-xs text-amber-600">Not covered by subscription</p>
                  )}
                </div>

                {/* Middle: quantity stepper */}
                <div className="mx-4 flex w-24 items-center justify-between rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.priceListItemId, -1)}
                    className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="text-sm tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.priceListItemId, 1)}
                    className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Right: line total + remove */}
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm font-medium tabular-nums text-foreground">
                    {formatNaira(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.priceListItemId)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total row */}
      {addedItems.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="font-[family-name:var(--font-jakarta)] text-lg font-bold tabular-nums text-foreground">
            {formatNaira(totalAmount)}
          </span>
        </div>
      )}
    </section>
  )
}
