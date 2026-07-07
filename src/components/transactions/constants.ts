export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

// payment_channel is a free string from the backend, not a fixed enum — and is
// null until the payment gateway reports which channel was actually used.
export function formatPaymentChannel(channel: string | null): string {
  if (!channel) return "—"
  return channel
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
