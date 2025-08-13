export const metadata = { title: "ProductPhotoPop" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, Arial, sans-serif", padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
