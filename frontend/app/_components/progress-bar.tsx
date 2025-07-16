interface ProgressBarProps {
  current: number
  total: number
  min?: number
  max?: number
}

export function ProgressBar({ current, total, min = 0, max }: ProgressBarProps) {
  const percentage = (current / total) * 100
  const displayMax = max || total

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>${min.toFixed(2)}</span>
        <span>${displayMax.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-400 rounded-full h-8 relative overflow-hidden">
        <div
          className="bg-orange-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">${current.toFixed(2)}</span>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <span className="text-white font-semibold text-sm">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
