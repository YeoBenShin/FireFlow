"use client"

import React, { useState, useEffect } from "react"
import { Car, Home, Plane, GraduationCap, DollarSign } from "lucide-react"

interface Goal {
  goal_id: number;
  title: string;
  category: string;
  target_date: string;
  amount: number;
  status: string;
  isCollaborative: boolean;
  description?: string;
  user_id: string;
  participantCount?: number;
}

interface GoalWithParticipant {
  goal_id: number;
  role: "owner" | "collaborator";
  allocated_amount: number;
  goal: Goal;
}

interface DisplayGoal {
  id: number;
  title: string;
  icon: React.ReactNode;
  date: string;
  daysLeft: number;
  current: number;
  target: number;
}

export function GoalsSection() {
  const [goalData, setGoalData] = useState<GoalWithParticipant[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = async () => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:5100/api/goals/with-participants", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.statusText}`)
      }

      const data: GoalWithParticipant[] = await response.json()

      // Group by goal_id and sum allocated_amounts for collaborative and personal goals
      const aggregatedGoalsMap = new Map<number, { goal: Goal; totalAllocated: number }>()
      for (const item of data) {
        const key = item.goal.goal_id
        if (aggregatedGoalsMap.has(key)) {
          const existing = aggregatedGoalsMap.get(key)!
          existing.totalAllocated += item.allocated_amount
        } else {
          aggregatedGoalsMap.set(key, { goal: item.goal, totalAllocated: item.allocated_amount })
        }
      }

      // Convert map to array and sort
      const upcomingGoals = Array.from(aggregatedGoalsMap.values())
        .filter(({ goal }) => new Date(goal.target_date) >= new Date())
        .sort((a, b) => new Date(a.goal.target_date).getTime() - new Date(b.goal.target_date).getTime())
        .slice(0, 3)

      setGoalData(
        upcomingGoals.map((entry) => ({
          goal_id: entry.goal.goal_id,
          role: "owner", // general role placeholder
          allocated_amount: entry.totalAllocated,
          goal: entry.goal,
        }))
      )
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "car":
        return <Car className="w-5 h-5" />
      case "home":
        return <Home className="w-5 h-5" />
      case "travel":
        return <Plane className="w-5 h-5" />
      case "education":
        return <GraduationCap className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getDaysLeft = (dateStr: string) => {
    const today = new Date()
    const due = new Date(dateStr)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const goals: DisplayGoal[] = goalData.map((item) => ({
    id: item.goal.goal_id,
    title: item.goal.title,
    icon: getIconForCategory(item.goal.category),
    date: formatDate(item.goal.target_date),
    daysLeft: getDaysLeft(item.goal.target_date),
    current: item.allocated_amount,
    target: item.goal.amount,
  }))

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imminent Goals</h3>

      {loading ? (
        <p>Loading goals...</p>
      ) : (
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
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-orange-500 font-medium">
                    {Math.round(percentage)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
