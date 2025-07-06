interface ExpenseCardProps {
  amount: number
  title: string
}

export function ExpenseCard({ amount, title }: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
        <span className="text-gray-600 font-medium">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800">${amount.toLocaleString()}</div>
    </div>
  )
}
