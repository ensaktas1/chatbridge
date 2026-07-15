import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatBridge — AI sohbetlerini modeller arasında taşı",
  description: "ChatGPT, Claude ve Gemini sohbetlerini tek, temiz ve paylaşılabilir bağlantıya dönüştür.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}
