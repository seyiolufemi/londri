import type { DiscoveryBusiness, ServiceType } from "@/types"

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export default function BusinessCard({ business }: { business: DiscoveryBusiness }) {
  return (
    <div className="cursor-pointer rounded-xl p-4 text-center transition-colors hover:bg-muted/50">
      {/* Illustration — centered */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/illustrations/washing-machines/${business.illustrationVariant}`}
        alt=""
        aria-hidden="true"
        className="mx-auto block h-56 w-auto object-contain"
      />

      {/* Content */}
      <div className="mt-6">
        <h3 className="font-[family-name:var(--font-jakarta)] text-base font-semibold text-foreground">
          {business.name}
        </h3>

        <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <span>{business.distanceKm}km away</span>
          <span>·</span>
          {business.isOpen ? (
            <span className="flex items-center gap-1.5 text-green-600">
              <span className="size-1.5 rounded-full bg-green-500" />
              Open now
            </span>
          ) : (
            <span>Closed</span>
          )}
        </div>

        {/* Service tags — max 2 */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {business.serviceTypes.slice(0, 2).map((type) => (
            <span
              key={type}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {SERVICE_TYPE_LABELS[type]}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[15px] font-bold tabular-nums text-foreground">
          From {formatNaira(business.cheapestPrice)}
        </p>
      </div>
    </div>
  )
}
