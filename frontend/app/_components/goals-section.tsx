"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Car, Plane, Home, GraduationCap, Package } from "lucide-react"

interface Goal {
  goal_id: number
  title: string
  category: string
  target_date: string
  amount: number
  status: string
  description?: string
  isCollaborative: boolean
  user_id: string
}

interface GoalWithParticipant {
  goal_id: number
  role: 'owner' | 'collaborator'
  allocated_amount: number
  goal: Goal
}

const getCategoryIcon = (category: string) => {
  const icons = {
    car: <Car className="w-5 h-5" />,
    home: <Home className="w-5 h-5" />,
    travel: <Plane className="w-5 h-5" />,
    education: <GraduationCap className="w-5 h-5" />,
    other: <Package className="w-5 h-5" />,
  }
  return icons[category as keyof typeof icons] || icons.other
}

export function GoalsSection() {
  const [goals, setGoals] = useState<GoalWithParticipant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImminentGoals = async () => {
      try {
        const response = await fetch('http://localhost:5100/api/goals/with-participants', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          // Extract goals and sort by target_date (most imminent first)
          const allGoals = data.map((item: GoalWithParticipant) => ({
            ...item.goal,
            userRole: item.role,
            userAllocatedAmount: item.allocated_amount
          }))
          
          // take first 3 fastest goals
          const imminentGoals = allGoals
            .filter((goal: any) => goal.status === 'pending')
            .sort((a: any, b: any) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
            .slice(0, 3)
          
          setGoals(imminentGoals.map((goal: any) => ({
            goal_id: goal.goal_id,
            role: goal.userRole,
            allocated_amount: goal.userAllocatedAmount,
            goal: goal
          })))
        }
      } catch (error) {
        console.error("Error fetching imminent goals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImminentGoals()
  }, [])

  const getDaysLeft = (target_date: string) => {
    const today = new Date()
    const due = new Date(target_date)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Imminent Goals</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imminent Goals</h3>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No imminent goals found. Create a goal to get started!</p>
          </div>
        ) : (
          goals.map((goalItem) => {
            const goal = goalItem.goal
            const daysLeft = getDaysLeft(goal.target_date)
            const currentAmount = goalItem.allocated_amount || 0 // TODO: This should be total allocated amount for collaborative goals
            const percentage = (currentAmount / goal.amount) * 100

            return (
              <div key={goal.goal_id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{goal.title}</div>
                    <div className="text-sm text-gray-600">
                      {daysLeft} Days Left ({formatDate(goal.target_date)})
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">${currentAmount.toLocaleString()}</span>
                    <span className="text-gray-600">${goal.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-orange-500 font-medium">{Math.round(percentage)}%</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
