import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutSlot",
  description: "Premium salon booking SaaS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
