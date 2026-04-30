import type { Metadata } from "next";
import { Montserrat, Arimo, Geist, Grape_Nuts } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  weight: "400",
});

const arimo = Arimo({
  subsets: ["latin"],
  variable: "--font-arimo",
});

const grapeNuts = Grape_Nuts({
  subsets: ["latin"],
  variable: "--font-grape-nuts",
  weight: "400",
});

export const metadata: Metadata = {
  title: "dev.narrate",
  description: "Share your coding journey with the world",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geist.variable,
        montserrat.variable,
        arimo.variable,
        grapeNuts.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
