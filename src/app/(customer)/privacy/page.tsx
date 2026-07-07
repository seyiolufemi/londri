import Navbar from "@/components/customer/Navbar"
import Footer from "@/components/customer/Footer"

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "When you use Londri, we collect information you provide directly — your name, email address, WhatsApp number, and pickup address — as well as order details like the items and services you request. If you sign in to track your orders, we associate this information with your account.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to process orders, connect you with laundry businesses, send order and quote-request notifications, and improve the platform. We do not sell your personal information to third parties.",
  },
  {
    title: "3. WhatsApp Communications",
    body: "We collect your WhatsApp number so laundry businesses can reach you directly about pickup timing, order updates, or quote requests, and so you can reach them the same way. Message delivery is handled by WhatsApp directly — Londri does not store the content of these conversations.",
  },
  {
    title: "4. Data Sharing",
    body: "We share your order details (name, contact information, pickup address, and items) only with the laundry business you've ordered from or requested a quote from, so they can fulfill your request. We do not share your information with unrelated third parties for marketing purposes.",
  },
  {
    title: "5. Data Security",
    body: "Payment information is handled securely by our payment partner, Nomba — Londri does not store your card or bank details directly. We take reasonable technical and organizational measures to protect the personal information we do hold.",
  },
  {
    title: "6. Your Rights",
    body: "You can request a copy of the personal information we hold about you, ask us to correct inaccurate details, or request deletion of your account and associated data, subject to any records we're required to keep for legal or accounting purposes.",
  },
  {
    title: "7. Contact Us",
    body: "If you have questions about this Privacy Policy or how your information is handled, reach us at hello@londri.app or via the Contact Us page.",
  },
]

function formatLastUpdated(): string {
  return new Date().toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-bold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 mb-8 text-sm text-muted-foreground">
          Last updated: {formatLastUpdated()}
        </p>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 text-base font-semibold text-foreground">{section.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
