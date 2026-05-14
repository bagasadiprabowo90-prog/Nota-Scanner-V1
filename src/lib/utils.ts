export function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatRpShort(n: number) {
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + "jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + "rb";
  return "Rp " + n;
}

export function exportToCSV(transactions: { id: string; type: string; category: string; description: string; amount: number; date: string; source?: string }[]) {
  const headers = ["id", "type", "category", "description", "amount", "date", "source"];
  const rows = transactions.map(t =>
    [t.id, t.type, t.category, `"${t.description.replace(/"/g, '""')}"`, t.amount, t.date, t.source || ""].join(",")
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
