"use client";
import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useTransactions } from "@/lib/TransactionContext";
import { useNotification } from "@/lib/NotificationContext";

const EXPENSE_CATEGORIES = ["Makanan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya"];
const INCOME_CATEGORIES = ["Gaji", "Freelance", "Bisnis", "Investasi", "Hadiah", "Lainnya"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "income" | "expense";
  prefillDescription?: string;
  prefillAmount?: number;
}

export default function AddTransactionModal({ isOpen, onClose, defaultType = "expense", prefillDescription = "", prefillAmount }: Props) {
  const { addTransaction } = useTransactions();
  const { addNotification } = useNotification();
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState(prefillAmount ? String(prefillAmount) : "");
  const [category, setCategory] = useState(type === "income" ? "Gaji" : "Makanan");
  const [description, setDescription] = useState(prefillDescription);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (!numAmount || numAmount <= 0) {
      addNotification("Masukkan jumlah yang valid", "error");
      return;
    }
    setLoading(true);
    await addTransaction({
      type,
      category,
      description,
      amount: numAmount,
      date: new Date(date).toISOString(),
      source: "manual",
    });
    addNotification(type === "income" ? "Pemasukan berhasil ditambahkan! 💰" : "Pengeluaran berhasil ditambahkan! 📝", "success");
    setLoading(false);
    onClose();
  };

  const formatAmount = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? parseInt(num).toLocaleString("id-ID") : "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {type === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
          <button
            type="button"
            onClick={() => { setType("income"); setCategory("Gaji"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              type === "income" ? "bg-emerald-500 text-white" : "bg-white text-gray-500"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Pemasukan
          </button>
          <button
            type="button"
            onClick={() => { setType("expense"); setCategory("Makanan"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              type === "expense" ? "bg-red-500 text-white" : "bg-white text-gray-500"
            }`}
          >
            <TrendingDown className="w-4 h-4" /> Pengeluaran
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                placeholder="0"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan transaksi..."
              className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity ${
              type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
            } disabled:opacity-60`}
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
