export function toSafeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function formatRp(n: unknown) {
  return "Rp " + toSafeNumber(n).toLocaleString("id-ID");
}

export function formatRpShort(n: unknown) {
  const amount = toSafeNumber(n);
  if (amount >= 1_000_000) return "Rp " + (amount / 1_000_000).toFixed(1) + "jt";
  if (amount >= 1_000) return "Rp " + (amount / 1_000).toFixed(0) + "rb";
  return "Rp " + amount;
}

export function exportToCSV(transactions: { id: string; type: string; category: string; description?: string; amount: number; date: string; source?: string }[]) {
  const headers = ["id", "type", "category", "description", "amount", "date", "source"];
  const rows = transactions.map(t =>
    [t.id, t.type, t.category, `"${(t.description || "").replace(/"/g, '""')}"`, toSafeNumber(t.amount), t.date, t.source || ""].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transaksi_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
