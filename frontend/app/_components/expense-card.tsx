interface ExpenseCardProps {
  amount: string
  title: string
}

export function ExpenseCard({ amount, title }: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-600 font-medium">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800">${amount.toLocaleString()}</div>
    </div>
  )
}
