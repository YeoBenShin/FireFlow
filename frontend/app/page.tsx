"use client"

import { MainLayout } from "./_components/layout/main-layout"
import { ProgressBar } from "./_components/progress-bar"
import { ExpenseCard } from "./_components/expense-card"
import { MonthlyBreakdown } from "./_components/monthly-breakdown"
import { GoalsSection } from "./_components/goals-section"
import { RecentTransactions } from "./_components/recent-transactions"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [todaysExpenses, setTodaysExpenses] = useState<number>(0)
  const [monthlyBudget, setMonthlyBudget] = useState<number>(250)

  useEffect(() => {
    const fetchTodaysExpenses = async () => {
      try {
        const res = await fetch("http://localhost:5100/api/transactions/todays-expenses", {
          credentials: "include",
        })
        const data = await res.json()
        setTodaysExpenses(data.total || 0)
      } catch {
        setTodaysExpenses(0)
      }
    }
    fetchTodaysExpenses()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
    
        {/* Progress Bar */}
        <ProgressBar current={todaysExpenses} total={monthlyBudget} max={monthlyBudget} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <ExpenseCard amount={todaysExpenses} title="Day's Expenses" />
            <ExpenseCard amount={monthlyBudget-todaysExpenses} title="Remaining Budget" />
            <MonthlyBreakdown />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <GoalsSection />
            <RecentTransactions />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
