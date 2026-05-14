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

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!GSHEET_URL) return [];
  try {
    const res = await fetch(`${GSHEET_URL}?action=getAll`, { cache: "no-store" });
    const data = await res.json();
    return data.transactions || [];
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
    const res = await fetch(GSHEET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(new TextEncoder().encode(body).length),
      },
      body,
    });
    const data = await res.json();
    return data.transaction || null;
  } catch {
    return null;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  if (!GSHEET_URL) return false;
  try {
    const body = JSON.stringify({ action: "delete", id });
    const res = await fetch(GSHEET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(new TextEncoder().encode(body).length),
      },
      body,
    });
    const data = await res.json();
    return data.success || false;
  } catch {
    return false;
  }
}

// Local storage fallback helpers
const LS_KEY = "money_transactions";

export function localGetTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function localAddTransaction(tx: Omit<Transaction, "id">): Transaction {
  const newTx: Transaction = { ...tx, id: Date.now().toString() };
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
  existing[idx] = { ...existing[idx], ...updates };
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
  return existing[idx];
}
