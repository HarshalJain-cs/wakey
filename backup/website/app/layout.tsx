import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import CosmicBackgroundWrapper from "@/components/3d/CosmicBackgroundWrapper";
import { SoundProvider } from "@/components/providers/SoundProvider";
import LoadingScreen from "@/components/effects/LoadingScreen";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Wakey - Wake Up Your Productivity | AI-Powered Focus App",
  description: "77 features. Zero distractions. 100% local. The last productivity app you'll ever need. Track time, focus deeply, and master your workflow with AI-powered insights.",
  keywords: ["productivity", "focus timer", "time tracking", "AI insights", "JARVIS", "pomodoro", "distraction blocker"],
  authors: [{ name: "Wakey Team" }],
  openGraph: {
    title: "Wakey - Wake Up Your Productivity",
    description: "77 features. Zero distractions. 100% local.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakey - Wake Up Your Productivity",
    description: "77 features. Zero distractions. 100% local.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SoundProvider>
          <LoadingScreen />
          <CustomCursor />
          <CosmicBackgroundWrapper />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          <Footer />
        </SoundProvider>
      </body>
    </html>
  );
}
