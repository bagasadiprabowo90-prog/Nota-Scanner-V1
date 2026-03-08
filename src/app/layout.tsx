import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import FloatingNotification from "@/components/FloatingNotification";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { NotificationProvider } from "@/lib/NotificationContext";
import { TransactionProvider } from "@/lib/TransactionContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  title: "Money Scanner",
  description: "Scan struk belanja & kelola keuangan Anda",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Money Scanner",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Money Scanner" />
        <link rel="apple-touchicons/icon-192-icon" href="/x192.png" />
      </head>
      <body className="bg-gray-50 font-sans antialiased">
        <NotificationProvider>
          <TransactionProvider>
            <FloatingNotification />
            <PWAInstallPrompt />
            <main className="max-w-lg mx-auto min-h-screen pb-20">
              {children}
            </main>
            <BottomNav />
          </TransactionProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
