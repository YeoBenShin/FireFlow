import type React from "react"
import { Car, Plane } from "lucide-react"

interface Goal {
  id: string
  title: string
  daysLeft: number
  date: string
  current: number
  target: number
  icon: React.ReactNode
}

const goals: Goal[] = [
  {
    id: "1",
    title: "Korea Trip",
    daysLeft: 10,
    date: "21 May 2025",
    current: 2100,
    target: 3000,
    icon: <Plane className="w-5 h-5" />,
  },
  {
    id: "2",
    title: "Red Tesla",
    daysLeft: 20,
    date: "31 May 2025",
    current: 2000,
    target: 4000,
    icon: <Car className="w-5 h-5" />,
  },
]

export function GoalsSection() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imminent Goals</h3>

      <div className="space-y-4">
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100

          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{goal.title}</div>
                  <div className="text-sm text-gray-600">
                    {goal.daysLeft} Days Left ({goal.date})
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">${goal.current.toLocaleString()}</span>
                  <span className="text-gray-600">${goal.target.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-orange-500 font-medium">{Math.round(percentage)}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
