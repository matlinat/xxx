// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "ProductPhotoPop",
  description: "Hintergrund in Sekunden entfernen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // optional:
  // adjustFontFallback: false, // wenn du *nie* Times sehen willst
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body
        className={`${inter.className} min-h-dvh bg-white text-gray-900 antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
