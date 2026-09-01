import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyMoneyTracker - Personal Finance Management",
  description:
    "Aplikasi pencatatan keuangan pribadi modern, elegan, dan kaya fitur dengan Next.js dan Firebase",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FinanceProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster
                richColors
                closeButton
                position="top-right"
                duration={4500}
                toastOptions={{
                  classNames: {
                    closeButton:
                      "!bg-white/90 dark:!bg-slate-800/90 !text-slate-600 dark:!text-slate-300 !border !border-slate-200 dark:!border-slate-700 hover:!scale-105 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-all",
                  },
                }}
              />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
