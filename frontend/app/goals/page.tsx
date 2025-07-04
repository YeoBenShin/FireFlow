"use client"

import { useState } from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Info, Plus, X } from "lucide-react"
import { AddGoalForm } from "../_components/forms/add-goal-form"
import { Badge } from "@/app/_components/ui/badge"
import Link from "next/link"

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)

  const personalGoals = [
    {
      id: "1",
      title: "Red Tesla",
      daysLeft: 10,
      date: "21 May 2025",
      current: 2000,
      target: 4000,
      category: "car",
      progress: 50,
    },
    {
      id: "2",
      title: "Bathroom Renovation",
      daysLeft: 30,
      date: "11 June 2025",
      current: 912.09,
      target: 3040.3,
      category: "home",
      progress: 30,
    },
  ]

  const collaborativeGoals = [
    {
      id: "3",
      title: "Korea Trip",
      daysLeft: 20,
      date: "31 May 2025",
      current: 2000,
      target: 4000,
      category: "travel",
      progress: 50,
      contributors: [
        { name: "Ben", amount: 1000, color: "bg-yellow-400" },
        { name: "Weichoon", amount: 1000, color: "bg-orange-400" },
      ],
      amountLeft: 2000,
    },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      car: "bg-blue-100 text-blue-800",
      home: "bg-green-100 text-green-800",
      travel: "bg-purple-100 text-purple-800",
      education: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      car: "Car",
      home: "Home",
      travel: "Travel",
      education: "Education",
      other: "Other",
    }
    return labels[category as keyof typeof labels] || "Other"
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen">
        {/* My Goals Section - Fixed width */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">My Goals</CardTitle>
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-gray-600">Available Savings</p>
                    <p className="text-2xl font-bold text-orange-500">$7,783.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Month's Saving</p>
                    <p className="text-2xl font-bold text-gray-600">$1,187.40</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
                <Link href="/allocate">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Savings
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Goals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Personal Goals
                <Info className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalGoals.map((goal) => {
                const calculatedProgress = Math.round((goal.current / goal.target) * 100)
                return (
                  <div key={goal.id} className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getCategoryColor(goal.category)}>{getCategoryLabel(goal.category)}</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-600">
                          {goal.daysLeft} Days Left ({goal.date})
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">${goal.current.toLocaleString()}</span>
                      <span className="text-gray-600">${goal.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-orange-500 font-medium">{calculatedProgress}%</div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Collaborative Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Collaborative Goals
                <Info className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collaborativeGoals.map((goal) => {
                const calculatedProgress = Math.round((goal.current / goal.target) * 100)
                return (
                  <div key={goal.id} className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getCategoryColor(goal.category)}>{getCategoryLabel(goal.category)}</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-600">
                          {goal.daysLeft} Days Left ({goal.date})
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">${goal.current.toLocaleString()}</span>
                      <span className="text-gray-600">${goal.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-orange-500 font-medium mb-3">{calculatedProgress}%</div>

                    {/* Contributors */}
                    <div className="space-y-2">
                      {goal.contributors.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${contributor.color}`} />
                            <span className="text-sm font-medium">{contributor.name}</span>
                          </div>
                          <span className="text-sm">${contributor.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Amount Left</span>
                        <span className="text-sm">${goal.amountLeft.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Shows form when active, savings info when not */}
        <div className="lg:col-span-1">
          {showForm ? (
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Add Goal</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <AddGoalForm onClose={() => setShowForm(false)} />
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Available Savings</CardTitle>
                <p className="text-sm text-gray-600">Ready to allocate to your goals</p>
                <p className="text-2xl font-bold text-orange-500">$7,783.00</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    You have savings ready to allocate to your goals. Click the button above to start allocating.
                  </p>
                  <Link href="/allocate">
                    <Button className="bg-blue-500 hover:bg-blue-600">Go to Allocation Page</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
