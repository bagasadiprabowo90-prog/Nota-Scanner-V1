"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  Transaction,
  localGetTransactions,
  localAddTransaction,
  localDeleteTransaction,
  localUpdateTransaction,
  localBackupTransactions,
  localRestoreFromBackup,
} from "./gsheets";

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  reload: () => void;
}

const TransactionContext = createContext<TransactionContextValue>({
  transactions: [],
  addTransaction: async () => ({ id: "", type: "expense", category: "", description: "", amount: 0, date: "" }),
  updateTransaction: () => {},
  deleteTransaction: () => {},
  reload: () => {},
});

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // Start with empty array to avoid hydration mismatch (server renders [], client loads after mount)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const isInitialized = useRef(false);

  const reload = useCallback(() => {
    // Reload from localStorage only
    const localData = localGetTransactions();
    setTransactions(localData);
    // Update backup whenever we reload
    localBackupTransactions(localData);
  }, []);

  // Load transactions after mount (prevents hydration mismatch)
  useEffect(() => {
    let localData = localGetTransactions();

    // If localStorage is empty, try to restore from sessionStorage backup
    if (localData.length === 0) {
      const restored = localRestoreFromBackup();
      if (restored.length > 0) {
        localData = restored;
      }
    }

    setTransactions(localData);
    localBackupTransactions(localData);
    isInitialized.current = true;
  }, []);

  // Cross-tab sync: listen for localStorage changes from other tabs/windows
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key !== "money_transactions") return;
      if (!e.newValue) {
        // localStorage was cleared — try restore from backup
        const restored = localRestoreFromBackup();
        if (restored.length > 0) {
          setTransactions(restored);
        } else {
          setTransactions([]);
        }
      } else {
        try {
          const data = JSON.parse(e.newValue);
          const normalized = localGetTransactions(); // normalize safely
          setTransactions(normalized);
          localBackupTransactions(normalized);
        } catch {
          // Corrupted data in other tab — keep current state
        }
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Periodically backup transactions to sessionStorage (every 30s)
  useEffect(() => {
    if (!isInitialized.current) return;
    const interval = setInterval(() => {
      if (transactions.length > 0) {
        localBackupTransactions(transactions);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [transactions]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id">) => {
    // Save to localStorage only
    const newTx = localAddTransaction(tx);
    const updated = localGetTransactions();
    setTransactions(updated);
    localBackupTransactions(updated);
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, "id">>) => {
    localUpdateTransaction(id, updates);
    const updated = localGetTransactions();
    setTransactions(updated);
    localBackupTransactions(updated);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    localDeleteTransaction(id);
    const updated = localGetTransactions();
    setTransactions(updated);
    localBackupTransactions(updated);
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, reload }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
