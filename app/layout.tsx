import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full bg-gray-50 antialiased" lang="en">
      <head />
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
