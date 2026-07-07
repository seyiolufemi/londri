import Navbar from "@/components/customer/Navbar"
import Footer from "@/components/customer/Footer"

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Londri — whether to browse laundry businesses, place an order, or manage a business listing — you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Use of the Platform",
    body: "Londri connects customers with independent laundry businesses. We provide the platform for discovery, ordering, and payment, but each laundry business is responsible for the services it delivers. You agree to use Londri only for lawful purposes and not to misrepresent your identity or order details.",
  },
  {
    title: "3. Bookings and Payments",
    body: "When you place an order, you're entering into an agreement directly with the laundry business you've selected. Prices shown are set by the business and may change without notice. Payments made through Londri are processed via our third-party payment partner; order confirmation is sent once payment is successfully received.",
  },
  {
    title: "4. Laundry Business Responsibilities",
    body: "Businesses listed on Londri are responsible for the accuracy of their pricing, service descriptions, and operating hours, and for fulfilling orders as described. Londri is not responsible for the quality of laundry services performed, but we may suspend a business's listing if we receive repeated, credible complaints.",
  },
  {
    title: "5. Customer Responsibilities",
    body: "You're responsible for providing accurate pickup details, contact information, and a clear description of your items when requesting a quote or placing an order. Please be available at the agreed pickup window — repeated missed pickups may affect your ability to order from a business in the future.",
  },
  {
    title: "6. Limitation of Liability",
    body: "Londri is provided on an \"as is\" basis. To the fullest extent permitted by law, we are not liable for any loss, damage, or delay to items arising from services performed by a laundry business, or for indirect or consequential damages arising from your use of the platform.",
  },
  {
    title: "7. Changes to Terms",
    body: "We may update these Terms and Conditions from time to time as Londri evolves. We'll update the \"Last updated\" date below when we do. Continuing to use the platform after changes are posted means you accept the revised terms.",
  },
  {
    title: "8. Contact Information",
    body: "Questions about these terms? Reach us at hello@londri.app or via the Contact Us page — we're happy to help.",
  },
]

function formatLastUpdated(): string {
  return new Date().toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-bold text-foreground">
          Terms and Conditions
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
