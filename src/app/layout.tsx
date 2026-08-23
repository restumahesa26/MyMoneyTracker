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
              <Toaster richColors position="top-right" />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
