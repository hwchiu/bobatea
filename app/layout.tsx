import { I18nProvider } from "@/lib/i18n";
import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "tMIC Workspace",
  description: "Low-Code API & AI Crawler Designer for marketing intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <I18nProvider><Shell>{children}</Shell></I18nProvider>
      </body>
    </html>
  );
}
