// Google Sheets via Apps Script Web App
// Setup: Create a Google Sheet + Apps Script as described in README
// Set NEXT_PUBLIC_GSHEET_URL env var to your deployed web app URL

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string; // ISO string
  source?: string; // "manual" | "scan"
}

const GSHEET_URL = process.env.NEXT_PUBLIC_GSHEET_URL || "";
const LS_KEY = "money_transactions";

function normalizeDate(value: unknown): string {
  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle strings
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return new Date().toISOString();

    // Try to parse as-is first (ISO format)
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    // Try to parse DD/MM/YYYY or DD-MM-YYYY format (common in Indonesia)
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1; // JS months are 0-indexed
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
      const date = new Date(year, month, day);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Try to parse MM/DD/YYYY format (US format)
    const mdyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdyMatch) {
      const month = parseInt(mdyMatch[1], 10) - 1;
      const day = parseInt(mdyMatch[2], 10);
      const year = parseInt(mdyMatch[3], 10);
      const date = new Date(year, month, day);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  // Handle numbers (timestamps)
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  
  const str = value.trim();
  if (!str) return 0;
  
  // Remove currency symbols and whitespace
  let cleaned = str.replace(/[Rp\s]/gi, "").trim();
  if (!cleaned) return 0;
  
  // Detect locale format: if has both dot and comma
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  
  if (lastDot > lastComma) {
    // European/Indonesian format: 1.000.000 or 1.000,50
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastComma > lastDot) {
    // US format: 1,000,000 or 1,000.50
    cleaned = cleaned.replace(/,/g, "");
  } else {
    // Only one separator or none
    cleaned = cleaned.replace(/,/g, "");
  }
  
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function normalizeTransaction(tx: Partial<Transaction> & Record<string, unknown>): Transaction {
  return {
    id: String(tx.id || Date.now()),
    type: tx.type === "income" ? "income" : "expense",
    category: String(tx.category || "Lainnya"),
    description: String(tx.description || ""),
    amount: parseAmount(tx.amount),
    date: normalizeDate(tx.date),
    source: typeof tx.source === "string" ? tx.source : undefined,
  };
}

function normalizeTransactions(value: unknown): Transaction[] {
  if (!Array.isArray(value)) return [];
  return value.map((tx) => normalizeTransaction(tx as Partial<Transaction> & Record<string, unknown>));
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!GSHEET_URL) return [];
  try {
    const res = await fetch("/api/gsheet", { cache: "no-store" });
    const data = await res.json();
    return normalizeTransactions(data.transactions);
  } catch {
    return [];
  }
}

export async function addTransaction(tx: Omit<Transaction, "id">): Promise<Transaction | null> {
  if (!GSHEET_URL) {
    // fallback: local storage only
    return { ...tx, id: Date.now().toString() };
  }
  try {
    const body = JSON.stringify({ action: "add", ...tx });
    const res = await fetch("/api/gsheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    return data.transaction ? normalizeTransaction(data.transaction) : null;
  } catch {
    return null;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  if (!GSHEET_URL) return false;
  try {
    const body = JSON.stringify({ action: "delete", id });
    const res = await fetch("/api/gsheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    return data.success || false;
  } catch {
    return false;
  }
}

export function localGetTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const transactions = normalizeTransactions(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
    localStorage.setItem(LS_KEY, JSON.stringify(transactions));
    return transactions;
  } catch {
    return [];
  }
}

export function localAddTransaction(tx: Omit<Transaction, "id">): Transaction {
  const newTx = normalizeTransaction({ ...tx, id: Date.now().toString() });
  const existing = localGetTransactions();
  localStorage.setItem(LS_KEY, JSON.stringify([newTx, ...existing]));
  return newTx;
}

export function localDeleteTransaction(id: string): void {
  const existing = localGetTransactions();
  localStorage.setItem(LS_KEY, JSON.stringify(existing.filter((t) => t.id !== id)));
}

export function localUpdateTransaction(id: string, updates: Partial<Omit<Transaction, "id">>): Transaction | null {
  const existing = localGetTransactions();
  const idx = existing.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  existing[idx] = normalizeTransaction({ ...existing[idx], ...updates, id });
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
  return existing[idx];
}
