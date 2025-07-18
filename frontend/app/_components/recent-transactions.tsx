"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import React, { useEffect, useState } from "react"

interface Transaction {
  id: number;
  type: string;
  dateTime: string;
  amount: number;
  description?: string;
  category?: string;
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("authToken")
        
        if (!token) {
          setError("No authentication token found. Please login.")
          setLoading(false)
          return
        }
        
        console.log("Token:", token);
        
        const res = await fetch('http://localhost:5100/api/transactions/filter', {
          method: 'POST',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Request 5 most recent transactions
        })
        
        if (res.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("authToken")
          setError("Authentication failed. Please login again.")
        } else if (!res.ok) {
          throw new Error("Failed to fetch transactions")
        } else {
          const data = await res.json()
          setTransactions(data)
        }
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-gray-500">No transactions found.</div>
          ) : (
            transactions.map((transaction) => {
              // Format date and time from dateTime string
              const dateObj = new Date(transaction.dateTime)
              const date = dateObj.toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              const time = dateObj.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
              return (
                <div key={transaction.id}>
                  <div className="text-sm text-gray-600 mb-2">{date}</div>
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-600">{transaction.category}</div>
                      <div className="text-xs text-orange-500">{time}</div>
                    </div>
                    <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
