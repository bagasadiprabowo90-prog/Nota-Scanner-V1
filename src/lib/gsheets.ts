// Google Sheets via Apps Script Web App
// Setup: Create a Google Sheet + Apps Script as described in README
// Set NEXT_PUBLIC_GSHEET_URL env var to your deployed web app URL
import { toSafeNumber } from "./utils";

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

function normalizeDate(value: unknown) {
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }

  return new Date().toISOString();
}

export function normalizeTransaction(tx: Partial<Transaction> & Record<string, unknown>): Transaction {
  return {
    id: String(tx.id || Date.now()),
    type: tx.type === "income" ? "income" : "expense",
    category: String(tx.category || "Lainnya"),
    description: String(tx.description || ""),
    amount: toSafeNumber(tx.amount),
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
