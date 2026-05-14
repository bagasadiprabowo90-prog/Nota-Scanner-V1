"use client";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Trash2, Search, Filter, Pencil, Calendar, Download } from "lucide-react";
import { useTransactions } from "@/lib/TransactionContext";
import { useNotification } from "@/lib/NotificationContext";
import AddTransactionModal from "@/components/AddTransactionModal";
import { formatRp, exportToCSV } from "@/lib/utils";
import { Transaction } from "@/lib/gsheets";

export default function TransaksiPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const { addNotification } = useNotification();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filter === "all" || t.type === filter)
      .filter((t) =>
        !search ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase())
      )
      .filter((t) => {
        if (!dateFrom && !dateTo) return true;
        const td = new Date(t.date).getTime();
        const from = dateFrom ? new Date(dateFrom).getTime() : 0;
        const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : Infinity;
        return td >= from && td <= to;
      });
  }, [transactions, filter, search, dateFrom, dateTo]);

  const handleDelete = (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      deleteTransaction(id);
      addNotification("Transaksi dihapus", "info");
    }
  };

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const dateKey = new Date(tx.date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="p-4 pb-10 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500">{transactions.length} total transaksi</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors"
        >
          <span className="text-white text-xl leading-none">+</span>
        </button>
        {transactions.length > 0 && (
          <button
            onClick={() => exportToCSV(filtered)}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? f === "income" ? "bg-emerald-500 text-white" : f === "expense" ? "bg-red-500 text-white" : "bg-gray-800 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f === "all" ? <Filter className="w-4 h-4" /> : f === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {f === "all" ? "Semua" : f === "income" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            showDateFilter || dateFrom || dateTo ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Date Filter */}
      {showDateFilter && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Dari"
          />
          <span className="text-gray-400 text-xs">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Sampai"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Transactions */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada transaksi</p>
          <p className="text-gray-400 text-sm mt-1">Tambah transaksi pertama Anda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-emerald-100" : "bg-red-100"}`}>
                      {tx.type === "income"
                        ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                        : <TrendingDown className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.description || tx.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tx.category}</span>
                        {tx.source === "scan" && <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full">scan</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <p className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatRp(tx.amount)}
                      </p>
                      <button
                        onClick={() => { setEditTx(tx); setModalOpen(true); }}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTransactionModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTx(null); }} editTransaction={editTx} />
    </div>
  );
}
