"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Transaction,
  fetchTransactions,
  addTransaction as gsheetAdd,
  deleteTransaction as gsheetDelete,
  localGetTransactions,
  localAddTransaction,
  localDeleteTransaction,
  localUpdateTransaction,
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
  const [transactions, setTransactions] = useState<Transaction[]>(() => localGetTransactions());

  const reload = useCallback(async () => {
    const gsheetData = await fetchTransactions();
    if (gsheetData.length > 0) {
      // Smart merge: preserve local amounts if GSheet returns 0
      const localData = localGetTransactions();
      const localMap = new Map(localData.map(t => [t.id, t]));
      
      const merged = gsheetData.map(gsheetTx => {
        const localTx = localMap.get(gsheetTx.id);
        if (gsheetTx.amount === 0 && localTx && localTx.amount > 0) {
          return { ...gsheetTx, amount: localTx.amount };
        }
        return gsheetTx;
      });
      
      setTransactions(merged);
      localStorage.setItem("money_transactions", JSON.stringify(merged));
    } else {
      setTransactions(localGetTransactions());
    }
  }, []);

  // Load from Google Sheets on mount if available.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GSHEET_URL) {
      return;
    }

    let cancelled = false;

    async function loadRemoteTransactions() {
      const gsheetData = await fetchTransactions();
      if (cancelled) return;

      if (gsheetData.length > 0) {
        // Smart merge: preserve local amounts if GSheet returns 0
        const localData = localGetTransactions();
        const localMap = new Map(localData.map(t => [t.id, t]));
        
        const merged = gsheetData.map(gsheetTx => {
          const localTx = localMap.get(gsheetTx.id);
          // If GSheet has amount 0 but local has valid amount, use local
          if (gsheetTx.amount === 0 && localTx && localTx.amount > 0) {
            return { ...gsheetTx, amount: localTx.amount };
          }
          return gsheetTx;
        });
        
        setTransactions(merged);
        localStorage.setItem("money_transactions", JSON.stringify(merged));
      } else {
        setTransactions(localGetTransactions());
      }
    }

    void loadRemoteTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id">) => {
    // Always save to local first for responsiveness
    const newTx = localAddTransaction(tx);
    setTransactions(localGetTransactions());

    // Try Google Sheets if available
    if (process.env.NEXT_PUBLIC_GSHEET_URL) {
      const gsheetTx = await gsheetAdd(tx);
      if (gsheetTx) {
        // Replace local entry with GSheet version (may have server-generated ID)
        // But preserve amount if GSheet returned 0
        const finalAmount = (gsheetTx.amount === 0 && newTx.amount > 0) ? newTx.amount : gsheetTx.amount;
        const finalGsheetTx = { ...gsheetTx, amount: finalAmount };
        const current = localGetTransactions().map(t =>
          t.id === newTx.id ? finalGsheetTx : t
        );
        localStorage.setItem("money_transactions", JSON.stringify(current));
        setTransactions(current);
        return finalGsheetTx;
      }
    }
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, "id">>) => {
    localUpdateTransaction(id, updates);
    setTransactions(localGetTransactions());
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    localDeleteTransaction(id);
    setTransactions(localGetTransactions());

    // Try Google Sheets if available
    if (process.env.NEXT_PUBLIC_GSHEET_URL) {
      await gsheetDelete(id);
    }
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
