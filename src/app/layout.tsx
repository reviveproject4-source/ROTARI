import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TenantProvider } from "@/lib/tenant-context";
import { SaasShell } from "@/components/saas-shell";

export const metadata: Metadata = {
  title: "ROTARI SaaS - Platform Multi-Tenant POS & Retention CRM",
  description: "Platform Enterprise Multi-Tenant POS & Retention CRM Terintegrasi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TenantProvider>
            <SaasShell>{children}</SaasShell>
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
