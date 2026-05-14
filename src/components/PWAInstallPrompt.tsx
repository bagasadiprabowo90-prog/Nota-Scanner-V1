"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const isIOSRef = typeof window !== "undefined" ? /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) : false;
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isIOS = isIOSRef;

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = localStorage.getItem("pwa_dismissed");

    if (isIOS && !dismissed) {
      const t = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(t);
    }

    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_dismissed", "1");
  };

  if (!showBanner) return null;

  const isLogin = pathname === "/login";

  return (
    <>
      <div className={`fixed ${isLogin ? "bottom-4" : "bottom-20"} left-4 right-4 z-50 max-w-lg mx-auto`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-3 animate-slide-up">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-2xl">
            💰
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Install BLP Scan Nota</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isIOS ? "Tambah ke Home Screen untuk akses cepat!" : "Install aplikasi untuk pengalaman terbaik!"}
            </p>
            <button
              onClick={handleInstall}
              className="mt-2 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isIOS ? "Cara Install" : "Install Sekarang"}
            </button>
          </div>
          <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Cara Install di iPhone/iPad</h3>
              <button onClick={() => setShowIOSGuide(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { step: "1", text: 'Tap tombol **Share** (kotak dengan panah atas) di Safari' },
                { step: "2", text: 'Scroll ke bawah dan tap **"Add to Home Screen"**' },
                { step: "3", text: 'Tap **"Add"** di pojok kanan atas' },
                { step: "4", text: 'Aplikasi BLP Scan Nota akan muncul di Home Screen! 🎉' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <p
                    className="text-sm text-gray-700 pt-1"
                    dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowIOSGuide(false); setShowBanner(false); localStorage.setItem("pwa_dismissed", "1"); }}
              className="mt-5 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm"
            >
              Mengerti!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
