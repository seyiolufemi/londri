import { redirect } from "next/navigation"

// Subscriptions - disabled, future flow. See SubscriptionsPageContent.tsx in
// this folder for the preserved, fully intact implementation.
export default function SubscriptionsPage() {
  redirect("/overview")
}
