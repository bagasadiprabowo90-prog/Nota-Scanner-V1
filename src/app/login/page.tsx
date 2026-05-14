"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ReceiptText, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { FormEvent, useState } from "react";
import { AUTH_EMAIL_DOMAIN } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        setError(data.message || "Login gagal. Coba cek email dan password.");
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server login. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4fbf7] px-5 py-6 text-slate-950">
      <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-emerald-300/35 blur-3xl" />
      <div className="absolute -right-24 top-32 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-emerald-100 backdrop-blur">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <ReceiptText className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">Nota Scanner</span>
          </Link>
          <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Beta
          </div>
        </header>

        <section className="mt-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-emerald-50 shadow-lg shadow-emerald-950/10">
            <Sparkles className="h-3.5 w-3.5 text-lime-300" />
            Scan nota, angka langsung rapi
          </div>

          <h1 className="max-w-sm text-4xl font-black leading-[1.02] tracking-tight text-slate-950">
            Masuk dan lanjutkan catatan uangmu.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Simpan hasil scan struk, pantau transaksi, dan lihat laporan belanja tanpa drama spreadsheet manual.
          </p>
        </section>

        <section className="mt-7 rounded-[2rem] bg-white/90 p-4 shadow-2xl shadow-emerald-950/10 ring-1 ring-white backdrop-blur">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
              <WalletCards className="mb-2 h-5 w-5 text-emerald-600" />
              <p className="text-xs font-bold text-slate-800">Saldo aman</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Data lokal tetap tersimpan</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-3 ring-1 ring-cyan-100">
              <ShieldCheck className="mb-2 h-5 w-5 text-cyan-600" />
              <p className="text-xs font-bold text-slate-800">Akses pribadi</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Khusus tim BLP Beauty</p>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Email</span>
              <span className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={`nama${AUTH_EMAIL_DOMAIN}`}
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Password</span>
              <span className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                <LockKeyhole className="h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                />
                Ingat saya
              </label>
              <button type="button" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                Lupa password?
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memeriksa akses..." : "Masuk ke Dashboard"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Belum punya akun?{" "}
            <button type="button" className="font-bold text-emerald-700 hover:text-emerald-800">
              Buat akun baru
            </button>
          </p>
        </section>

        <p className="mt-auto pt-6 text-center text-[11px] leading-5 text-slate-500">
          Hanya email dengan domain {AUTH_EMAIL_DOMAIN} yang bisa masuk ke aplikasi ini.
        </p>
      </div>
    </div>
  );
}
