interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({current, total}: ProgressBarProps) {
  const percentage = (current / total) * 100
  
  return (
    <div className="w-lg">
      <div className="w-full bg-gray-400 rounded-full h-8 overflow-hidden">
        <div
          className="bg-orange-500 h-full rounded-full transition-all duration-300 relative"
          style={{ width: `${Math.min(percentage, 100)}%` }}>
            {/* Method 1, but there is erros when the percentage is too low */}
            <div className="absolute inset-1 flex items-center justify-end">
                <span className="text-white font-semibold text-sm">{percentage.toFixed(2)}%</span>
            </div>
            {/* Method 2, percentage is always in the centre (change relative to grey div) */}
            {/* <div className='absolute inset-0 flex items-center justify-center'>
                <span className="text-white font-semibold text-sm">{percentage.toFixed(2)}%</span>
            </div> */}
          </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-bold">${current}</span>
        <span className="font-bold">${total}</span>
      </div>

    </div>
  )
}
