"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, List, BarChart2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan Struk", icon: ScanLine },
  { href: "/transaksi", label: "Transaksi", icon: List },
  { href: "/report", label: "Report", icon: BarChart2 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? "stroke-emerald-600" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
