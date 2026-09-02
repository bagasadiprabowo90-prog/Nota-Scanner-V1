"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { AUTH_EMAIL_DOMAIN } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim().toLowerCase().endsWith(AUTH_EMAIL_DOMAIN)) {
      setError(`Email harus memakai domain ${AUTH_EMAIL_DOMAIN}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal. Cek email dan password.");
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-lg">BLP</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">BLP Scan Nota</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`nama${AUTH_EMAIL_DOMAIN}`}
                autoComplete="email"
                required
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
              <LockKeyhole className="h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-emerald-500"
              />
              Ingat saya
            </label>
            <p className="text-xs text-gray-400">Lupa password? Hubungi admin untuk reset.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Masuk ke Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
