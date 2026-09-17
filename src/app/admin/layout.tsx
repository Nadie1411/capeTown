import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@/app/globals.css";
import { AdminLocaleProvider } from "@/components/admin/i18n";
import { ToastProvider } from "@/components/admin/ui";
import { withBase } from "@/lib/base";

export const metadata: Metadata = { title: "Admin — Cape Town Contracting", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get("admin_lang")?.value === "ar" ? "ar" : "en";
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap" />
        <link rel="icon" href={withBase("/brand/mark.svg")} />
      </head>
      <body className="admin-root" dir={dir}>
        <AdminLocaleProvider lang={lang}>
          <ToastProvider>{children}</ToastProvider>
        </AdminLocaleProvider>
      </body>
    </html>
  );
}
