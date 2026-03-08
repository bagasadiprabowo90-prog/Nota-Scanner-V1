import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import FloatingNotification from "@/components/FloatingNotification";
import { NotificationProvider } from "@/lib/NotificationContext";
import { TransactionProvider } from "@/lib/TransactionContext";

export const metadata: Metadata = {
  title: "Money Scanner",
  description: "Scan struk belanja & kelola keuangan Anda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 font-sans antialiased">
        <NotificationProvider>
          <TransactionProvider>
            <FloatingNotification />
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
