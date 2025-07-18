"use client"

import { MainLayout } from "./_components/layout/main-layout"
import { ProgressBar } from "./_components/progress-bar"
import { ExpenseCard } from "./_components/expense-card"
import { MonthlyBreakdown } from "./_components/monthly-breakdown"
import { GoalsSection } from "./_components/goals-section"
import { RecentTransactions } from "./_components/recent-transactions"
import { useEffect, useState } from "react"
import { set } from "date-fns"

export default function HomePage() {
  const [todaysExpenses, setTodaysExpenses] = useState<number>(0)
  const [dailyBudget, setDailyBudget] = useState<number>(0)
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [monthlySavings, setMonthlySavings] = useState<number>(0)
  const [remainingDays, setRemainingDays] = useState<number>(0)
  

  useEffect(() => {
    const fetchTodaysExpenses = async () => {
      try {
        const res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/todays-expenses", {
          credentials: "include",
        })
        const data = await res.json()
        setTodaysExpenses(data.total)
        const expense = await fetch("https://fireflow-m0z1.onrender.com/api/dashboard/month-expense", {
              credentials: "include",
            })
        const expenseData = await expense.json()
        setTotalExpenses(expenseData)
        const income = await fetch("https://fireflow-m0z1.onrender.com/api/dashboard/month-income", {
              credentials: "include",
            })
        const incomeData = await income.json()
        setTotalIncome(incomeData)
        const today = new Date()
        const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const daysLeft = totalDaysInMonth - today.getDate() + 1 // include today
        setRemainingDays(daysLeft);
        const user = await fetch("https://fireflow-m0z1.onrender.com/api/users", {
          credentials: "include", 
        })
        const userData = await user.json()
        setMonthlySavings(userData.monthly_savings)
      } catch {
        setTodaysExpenses(0)
        setTotalIncome(0)
      }
    }  
    fetchTodaysExpenses()
  }, [])
  useEffect(() => {
    if (totalIncome === 0){
      setDailyBudget(0);
    } else {
      setDailyBudget(((totalIncome - (totalExpenses + monthlySavings)+ todaysExpenses) / remainingDays) || 0);
    }
    console.log(totalIncome, totalExpenses, monthlySavings, todaysExpenses, remainingDays, dailyBudget)
  },)
   
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
    
        {/* Progress Bar */}
        <ProgressBar current={todaysExpenses} total={dailyBudget === 0 ? todaysExpenses : dailyBudget} 
        max={dailyBudget === 0 ? todaysExpenses : dailyBudget} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <ExpenseCard amount={todaysExpenses.toFixed(2)} title="Today's Expenditure" />
            <ExpenseCard amount={(dailyBudget === 0 ? dailyBudget : dailyBudget-todaysExpenses).toFixed(2)} title="Remaining Budget for Today" />
            <MonthlyBreakdown monthlySavings = {monthlySavings}/>
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
