import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Transaction {
  id: string
  title: string
  category: string
  amount: number
  date: string
  time: string
  type: "income" | "expense"
}

const transactions: Transaction[] = [
  {
    id: "1",
    title: "Fruits And Vegetables",
    category: "Grocery",
    amount: -12.3,
    date: "Today, 18 May 2025",
    time: "10:30",
    type: "expense",
  },
  {
    id: "2",
    title: "Salary For The Month",
    category: "Income",
    amount: 4000.0,
    date: "Today, 18 May 2025",
    time: "16:27",
    type: "income",
  },
  {
    id: "3",
    title: "Rent For The Month",
    category: "Housing",
    amount: 2000.0,
    date: "Tue, 29 April 2025",
    time: "15:47",
    type: "income",
  },
]

export function RecentTransactions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id}>
            <div className="text-sm text-gray-600 mb-2">{transaction.date}</div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                {transaction.type === "income" ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{transaction.title}</div>
                <div className="text-sm text-gray-600">{transaction.category}</div>
                <div className="text-xs text-orange-500">{transaction.time}</div>
              </div>
              <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
