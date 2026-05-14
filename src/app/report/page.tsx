"use client";
import { useMemo } from "react";
import { useTransactions } from "@/lib/TransactionContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { formatRpShort } from "@/lib/utils";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

export default function ReportPage() {
  const { transactions } = useTransactions();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Monthly income vs expense (last 6 months)
  const monthlyData = useMemo(() => {
    const data: { month: string; pemasukan: number; pengeluaran: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mn = d.getMonth();
      const yr = d.getFullYear();
      const txs = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === mn && td.getFullYear() === yr;
      });
      data.push({
        month: d.toLocaleDateString("id-ID", { month: "short" }),
        pemasukan: txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        pengeluaran: txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return data;
  }, [transactions, currentMonth, currentYear]);

  // Expense by category (current month)
  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, currentYear]);

  const monthlyIncome = transactions
    .filter(t => { const d = new Date(t.date); return t.type === "income" && d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions
    .filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((s, t) => s + t.amount, 0);
  const monthlySaving = monthlyIncome - monthlyExpense;

  const monthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Laporan</h1>
        <p className="text-sm text-gray-500">{monthName}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-emerald-600 font-medium">Masuk</p>
          <p className="text-xs font-bold text-emerald-800 mt-0.5">{formatRpShort(monthlyIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
          <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-xs text-red-600 font-medium">Keluar</p>
          <p className="text-xs font-bold text-red-800 mt-0.5">{formatRpShort(monthlyExpense)}</p>
        </div>
        <div className={`border rounded-2xl p-3 text-center ${monthlySaving >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
          <PiggyBank className={`w-5 h-5 mx-auto mb-1 ${monthlySaving >= 0 ? "text-blue-500" : "text-orange-500"}`} />
          <p className={`text-xs font-medium ${monthlySaving >= 0 ? "text-blue-600" : "text-orange-600"}`}>Tabungan</p>
          <p className={`text-xs font-bold mt-0.5 ${monthlySaving >= 0 ? "text-blue-800" : "text-orange-800"}`}>{formatRpShort(Math.abs(monthlySaving))}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Tren 6 Bulan Terakhir</h3>
        {transactions.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Belum ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRpShort(v)} />
              <Tooltip formatter={(v) => "Rp " + Number(v).toLocaleString("id-ID")} />
              <Bar dataKey="pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} name="Pemasukan" />
              <Bar dataKey="pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart */}
      {expenseByCat.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Pengeluaran per Kategori (Bulan Ini)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={expenseByCat}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {expenseByCat.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => "Rp " + Number(v).toLocaleString("id-ID")} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Table */}
      {expenseByCat.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Rincian Pengeluaran</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {expenseByCat.map((cat, i) => {
              const pct = monthlyExpense > 0 ? (cat.value / monthlyExpense) * 100 : 0;
              return (
                <div key={cat.name} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Rp {cat.value.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{pct.toFixed(1)}% dari total pengeluaran</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <BarChart className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada data laporan</p>
          <p className="text-gray-400 text-sm mt-1">Mulai tambah transaksi untuk melihat laporan</p>
        </div>
      )}
    </div>
  );
}
