"use client"

import { Info } from "lucide-react"
import { DonutChart } from "./charts/donut-chart"
import { useEffect, useState } from "react"
import { Transaction } from "@/types/transaction"
// import { isSameMonth, parseISO } from "date-fns" // Uncomment if date-fns is installed

interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
    borderWidth: number
  }[]
}

const CHART_COLORS = [
  "#FDE68A", // yellow-200
  "#FCD34D", // yellow-300
  "#FBBF24", // yellow-400
  "#F59E42", // orange-300
  "#FB923C", // orange-400
  "#F97316", // orange-500
  "#EA580C", // orange-600
  "#FF7F50", // coral
  "#F87171", // red-400
  "#EF4444", // red-500
  "#DC2626", // red-600
  "#B91C1C", // red-700
]

export function MonthlyBreakdown({monthlySavings}) {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      },
    ],
  })
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch category expenses for the current month
        const res = await fetch("http://localhost:5100/api/transactions/category-expenses-monthly", {
          credentials: "include",
        })
        const categoryData: Record<string, number> = await res.json()
        // Sort categories by amount descending
        const sortedCategories = Object.entries(categoryData)
          .filter(([label]) => label && label.trim() !== "")
          .sort((a, b) => b[1] - a[1])
        let labels: string[] = []
        let values: number[] = []
        
        labels = sortedCategories.map(([label]) => label)
        values = sortedCategories.map(([, value]) => value)
        
        setChartData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        })
        
        setTotalExpenses(values.reduce((sum, v) => sum + v, 0))

        // Fetch all transactions to sum income for the month
        const txRes = await fetch("http://localhost:5100/api/transactions", {
          credentials: "include",
        })
        const transactions: Transaction[] = await txRes.json()
        const now = new Date()
        const thisMonthIncome = transactions.filter(tx => {
          if (tx.type !== "income") return false
          const txDate = new Date(tx.dateTime)
          return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth() && tx.amount > 0
        })
        setTotalIncome(thisMonthIncome.reduce((sum, tx) => sum + tx.amount, 0))
      } catch (err) {
        setChartData({
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        })
        setTotalExpenses(0)
        setTotalIncome(0)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const centerText = {
    title: "Total Expenses",
    value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Breakdown</h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <DonutChart data={chartData} centerText={centerText} />
      )}

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.labels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }}
            />
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium ml-auto">${(chartData.datasets[0].data[index] ?? 0).toFixed(2).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Income:</div>
          <div className="text-lg font-bold text-gray-800">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Remaining Budget:</div>
          <div className="text-lg font-bold text-gray-800">${(totalIncome === 0 ? 0 : totalIncome - totalExpenses - monthlySavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  )
}
