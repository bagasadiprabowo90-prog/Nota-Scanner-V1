"use client";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Plus, Minus } from "lucide-react";
import { useTransactions } from "@/lib/TransactionContext";
import AddTransactionModal from "@/components/AddTransactionModal";
import { formatRp } from "@/lib/utils";
import LogoutButton from "@/components/LogoutButton";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon.getTime();
}

function getWeekEnd() {
  const start = new Date(getWeekStart());
  const sun = new Date(start);
  sun.setDate(start.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun.getTime();
}

export default function HomePage() {
  const { transactions } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense">("expense");

  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;

  const weeklyExpenses = useMemo(() => {
    const s = getWeekStart();
    const e = getWeekEnd();
    return transactions.filter(t => t.type === "expense" && new Date(t.date).getTime() >= s && new Date(t.date).getTime() <= e);
  }, [transactions]);

  // Biggest expense category this week
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    weeklyExpenses.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [weeklyExpenses]);

  const biggestCategory = categoryTotals[0];
  const weeklyTotal = weeklyExpenses.reduce((s, t) => s + t.amount, 0);

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="p-4 pb-10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-gray-500">Selamat datang 👋</p>
          <h1 className="text-xl font-bold text-gray-900">Money Dashboard</h1>
        </div>
        <LogoutButton />
      </div>

      {/* Balance Card */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">Total Saldo</p>
        <p className="text-3xl font-bold mb-4">{formatRp(balance)}</p>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs opacity-80">Pemasukan</span>
            </div>
            <p className="font-bold text-sm">{formatRp(totalIncome)}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs opacity-80">Pengeluaran</span>
            </div>
            <p className="font-bold text-sm">{formatRp(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Weekly Biggest Expense */}
      {biggestCategory ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Pengeluaran Terbesar Minggu Ini</p>
            <p className="text-xs text-orange-600 mt-0.5">
              Kategori <span className="font-bold">{biggestCategory[0]}</span> — {formatRp(biggestCategory[1])}
            </p>
            <p className="text-xs text-orange-500 mt-0.5">Total minggu ini: {formatRp(weeklyTotal)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">Belum ada pengeluaran minggu ini. Yuk mulai catat! 📊</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setModalType("income"); setModalOpen(true); }}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 hover:bg-emerald-100 transition-colors"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-emerald-800">Tambah</p>
            <p className="text-xs text-emerald-600">Pemasukan</p>
          </div>
        </button>
        <button
          onClick={() => { setModalType("expense"); setModalOpen(true); }}
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-colors"
        >
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
            <Minus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-red-800">Tambah</p>
            <p className="text-xs text-red-600">Pengeluaran</p>
          </div>
        </button>
      </div>

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">Transaksi Terbaru</h2>
          <div className="space-y-2">
            {recentTx.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-emerald-100" : "bg-red-100"}`}>
                  {tx.type === "income"
                    ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.description || tx.category}</p>
                  <p className="text-xs text-gray-400">{tx.category} · {new Date(tx.date).toLocaleDateString("id-ID")}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatRp(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />
    </div>
  );
}
