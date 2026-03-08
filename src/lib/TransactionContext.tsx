"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Transaction, localGetTransactions, localAddTransaction, localDeleteTransaction } from "./gsheets";

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<Transaction>;
  deleteTransaction: (id: string) => void;
  reload: () => void;
}

const TransactionContext = createContext<TransactionContextValue>({
  transactions: [],
  addTransaction: async () => ({ id: "", type: "expense", category: "", description: "", amount: 0, date: "" }),
  deleteTransaction: () => {},
  reload: () => {},
});

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => localGetTransactions());

  const reload = useCallback(() => {
    setTransactions(localGetTransactions());
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id">) => {
    const newTx = localAddTransaction(tx);
    setTransactions(localGetTransactions());
    return newTx;
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    localDeleteTransaction(id);
    setTransactions(localGetTransactions());
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, reload }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
