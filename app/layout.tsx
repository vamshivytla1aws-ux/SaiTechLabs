import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionEffects } from "@/components/MotionEffects";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AssistantLoader } from "@/components/assistant/AssistantLoader";
import "./globals.css";

const bodyFont = Manrope({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Sora({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saitechlabs.in"),
  title: { default: "SaiTech Labs | Industry-Focused IT Training", template: "%s | SaiTech Labs" },
  description: "SaiTech Labs provides industry-focused training in Cloud, AI, DevOps, Databricks, Data Engineering, communication skills and interview preparation for students and recent graduates.",
  openGraph: { title: "SaiTech Labs | Industry-Focused IT Training", description: "Practical technology learning for students, graduates and early-career professionals.", url: "https://www.saitechlabs.in", siteName: "SaiTech Labs", type: "website", locale: "en_IN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "SaiTech Labs — Your launchpad to a top-tier IT career" }] },
  twitter: { card: "summary_large_image", title: "SaiTech Labs | Industry-Focused IT Training", description: "Innovate • Educate • Accelerate", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${bodyFont.variable} ${displayFont.variable}`}><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content">{children}</main><Footer /><AssistantLoader /><WhatsAppButton /><MotionEffects /></body></html>;
}
