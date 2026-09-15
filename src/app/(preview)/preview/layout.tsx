import "@/app/globals.css";

export const dynamic = "force-dynamic";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body className="site-root" suppressHydrationWarning>{children}</body>
    </html>
  );
}
