import type { Metadata } from "next";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutSlot",
  description: "Premium salon booking SaaS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
