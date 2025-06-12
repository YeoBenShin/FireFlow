import IconSelector from "./IconSelector";

export interface Transaction {
  id: string
  title: string
  category: string
  amount: number
  date: string
  time: string
  type: "income" | "expense"
}

interface TransactionProps {
  transaction: Transaction
}

export default function Transaction({transaction}: TransactionProps) {
  return (
      <div className="space-y-4">
          <div key={transaction.id}>
            <div className="hover:bg-gray-50 rounded-lg transition-colors p-3" >
              <div className="flex text-l text-gray-600 font-bold">{transaction.date}</div>
              <div className="flex items-center gap-3">
                <IconSelector />

                <div className="flex-1">
                  <div className="flex font-semibold text-gray-800">{transaction.title}</div>
                  <div className="flex text-sm text-gray-600">{transaction.category}</div>
                  <div className="flex text-xs text-orange-500">{transaction.time}</div>
                </div>

                <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                </div>

              </div>
            </div>
            
          </div>
      </div>
  )
}
