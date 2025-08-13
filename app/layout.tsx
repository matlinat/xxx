import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProductPhotoPop",
  description: "Hintergrund in Sekunden entfernen",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-dvh bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
