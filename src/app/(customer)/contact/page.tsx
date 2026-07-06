import { Mail, MessageCircle } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import Footer from "@/components/customer/Footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-bold text-foreground">
          Get in Touch
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Questions, feedback, or need help? We&apos;re here.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="mailto:hello@londri.app"
            className="flex items-center gap-3 rounded-lg bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <Mail className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">hello@londri.app</span>
          </a>

          <a
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <MessageCircle className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">Chat with us on WhatsApp</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
