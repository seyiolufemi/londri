import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Inter, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/redux/ReduxProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Londri",
    template: "%s | Londri",
  },
  description:
    "Londri is an all-in-one platform for laundry businesses to manage orders, payments, and customers — and for customers to find and book trusted laundry services nearby.",
  openGraph: {
    siteName: "Londri",
    type: "website",
    images: ["/logo+wordmark-teal.png"],
  },
  twitter: {
    card: "summary",
    images: ["/logo+wordmark-teal.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ReduxProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
