import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatBridge — Carry conversations between AI models",
  description: "Turn public ChatGPT, Claude, and Gemini conversations into one clean link any AI can read.",
  applicationName: "ChatBridge",
  keywords: ["ChatGPT", "Claude", "Gemini", "AI conversation", "conversation export"],
  openGraph: {
    title: "ChatBridge — Carry the context. Switch the model.",
    description: "One clean link for public ChatGPT, Claude, and Gemini conversations.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#151515", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}
