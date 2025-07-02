"use client"

import { ArrowUpRight, ArrowDownRight, Home, Bus, Utensils, ShoppingBag, DollarSign } from "lucide-react";
import React, { useEffect, useState } from "react"
import { addDays, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from 'date-fns';


interface Transaction {
  transId: number
  description: string
  type: "income" | "expense"
  amount: number
  dateTime: string
  category: string
  userId: string
}

interface RecentTransactionsProps {
  timeFilter: "Yearly" | "Monthly" | "Daily" | "Recent";
}

type IconName = "DollarSign" | "ShoppingBag" | "Home" | "Bus" | "Utensils";

const categoryIconMap: Record<string, IconName> = {
  food: "Utensils",
  transport: "Bus",
  medicine: "DollarSign",
  groceries: "ShoppingBag",
  rent: "Home",
  gifts: "ShoppingBag",
  savings: "DollarSign",
  entertainment: "ShoppingBag",
  utilities: "DollarSign",
  shopping: "ShoppingBag",
  education: "DollarSign",
  other: "DollarSign",
  salary: "DollarSign",
  freelance: "DollarSign",
  tutoring: "DollarSign",
  investment: "DollarSign",
  bonus: "DollarSign",
  rental: "Home",
  business: "DollarSign",
  commission: "DollarSign",
  dividend: "DollarSign",
  gift: "ShoppingBag",
};

const iconMap: Record<IconName, JSX.Element> = {
  DollarSign: <DollarSign className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
};

export function RecentTransactions({ timeFilter }: RecentTransactionsProps) {
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
        let body: any = {};
        const now = new Date();
        if (timeFilter === "Yearly") {
          body.dateDirection = "on";
          body.dateTime = format(startOfYear(now), 'yyyy-MM-dd');
          body.dateDirection = undefined; // fetch all for the year
        } else if (timeFilter === "Monthly") {
          body.dateDirection = undefined;
          body.dateTime = undefined;
          body.startDate = format(startOfMonth(now), 'yyyy-MM-dd');
          body.endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        } else if (timeFilter === "Daily") {
          body.dateDirection = undefined;
          body.dateTime = undefined;
          body.startDate = format(startOfDay(now), 'yyyy-MM-dd');
          body.endDate = format(endOfDay(now), 'yyyy-MM-dd');
        } else if (timeFilter === "Recent") {
          body.timeFilter = "Recent";
        }
        const res = await fetch('http://localhost:5100/api/transactions/filter', {
          method: 'POST',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
        if (res.status === 401) {
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
  }, [timeFilter])

  // Filter transactions based on timeFilter
  const now = new Date();
  let filteredTransactions = transactions;
  if (timeFilter === "Yearly") {
    const currentYear = now.getFullYear();
    filteredTransactions = transactions.filter(tx => {
      const txYear = new Date(tx.dateTime).getFullYear();
      return txYear === currentYear;
    });
  } else if (timeFilter === "Monthly") {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.dateTime);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    });
  } else if (timeFilter === "Daily") {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.dateTime);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && txDate.getDate() === currentDay;
    });
  } else if (timeFilter === "Recent") {
    filteredTransactions = transactions.slice(0, 5);
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-gray-500">No transactions found.</div>
          ) : (
            filteredTransactions.map((transaction) => {
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
              const iconKey = categoryIconMap[transaction.category] || "DollarSign";
              const icon = iconMap[iconKey] || <ArrowDownRight className="w-5 h-5" />;
              return (
                <div key={transaction.transId}>
                  <div className="text-sm text-gray-600 mb-2">{date}</div>
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      {icon}
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
