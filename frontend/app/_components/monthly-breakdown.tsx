import { Info } from "lucide-react"
import { DonutChart } from "./charts/donut-chart"

export function MonthlyBreakdown() {
  const chartData = {
    labels: ["Food & Dining", "Shopping", "Transportation", "Housing", "Entertainment"],
    datasets: [
      {
        data: [600, 400, 300, 500, 200],
        backgroundColor: [
          "#FB923C", // orange-400
          "#FBBF24", // yellow-400
          "#F97316", // orange-500
          "#EA580C", // orange-600
          "#FDE68A", // yellow-200
        ],
        borderWidth: 0,
      },
    ],
  }

  const centerText = {
    title: "Total Expenses",
    value: "$2,000.00",
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Breakdown</h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      <DonutChart data={chartData} centerText={centerText} />

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.labels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            />
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium ml-auto">${chartData.datasets[0].data[index].toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Income:</div>
          <div className="text-lg font-bold text-gray-800">$6,000.00</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Savings:</div>
          <div className="text-lg font-bold text-gray-800">$4,000.00</div>
        </div>
      </div>
    </div>
  )
}
