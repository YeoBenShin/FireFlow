"use client"

import { useState } from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Progress } from "@/app/_components/ui/progress"
import { Car, Plane, Home, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AllocatePage() {
  const router = useRouter()
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableSavings = 7783.0

  const goals = [
    {
      id: "1",
      title: "Red Tesla",
      daysLeft: 10,
      date: "21 May 2025",
      current: 2000,
      target: 4000,
      icon: <Car className="w-5 h-5" />,
      progress: 50,
      type: "personal",
    },
    {
      id: "2",
      title: "Bathroom Renovation",
      daysLeft: 30,
      date: "11 June 2025",
      current: 912.09,
      target: 3040.3,
      icon: <Home className="w-5 h-5" />,
      progress: 30,
      type: "personal",
    },
    {
      id: "3",
      title: "Korea Trip",
      daysLeft: 20,
      date: "31 May 2025",
      current: 2000,
      target: 4000,
      icon: <Plane className="w-5 h-5" />,
      progress: 50,
      type: "collaborative",
      contributors: [
        { name: "Ben", amount: 1000, color: "bg-yellow-400" },
        { name: "Weichoon", amount: 1000, color: "bg-orange-400" },
      ],
    },
  ]

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0)
  const remainingSavings = availableSavings - totalAllocated

  const handleAllocationChange = (goalId: string, value: string) => {
    const amount = Number.parseFloat(value) || 0
    setAllocations((prev) => ({
      ...prev,
      [goalId]: amount,
    }))
  }

  const handleMaxAllocation = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      const maxPossible = Math.min(remainingSavings + (allocations[goalId] || 0), goal.target - goal.current)
      setAllocations((prev) => ({
        ...prev,
        [goalId]: maxPossible,
      }))
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate allocation process
    setTimeout(() => {
      console.log("Allocations:", allocations)
      setIsSubmitting(false)
      router.push("/goals")
    }, 1000)
  }

  const getNewProgress = (goal: any) => {
    const allocation = allocations[goal.id] || 0
    const newCurrent = goal.current + allocation
    return (newCurrent / goal.target) * 100
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/goals">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Allocate Savings</h1>
        </div>

        {/* Available Savings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Available Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Available</p>
                <p className="text-3xl font-bold text-orange-500">${availableSavings.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">To Allocate</p>
                <p className="text-3xl font-bold text-blue-600">${totalAllocated.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-3xl font-bold text-green-600">${remainingSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personal Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals
                .filter((goal) => goal.type === "personal")
                .map((goal) => {
                  const allocation = allocations[goal.id] || 0
                  const newProgress = getNewProgress(goal)
                  const maxPossible = Math.min(remainingSavings + allocation, goal.target - goal.current)

                  return (
                    <div key={goal.id} className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-gray-600">
                            {goal.daysLeft} Days Left ({goal.date})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Current: ${goal.current.toLocaleString()}</span>
                          <span>Target: ${goal.target.toLocaleString()}</span>
                        </div>

                        <Progress value={goal.progress} className="mb-2" />

                        <div className="space-y-2">
                          <Label htmlFor={`allocation-${goal.id}`}>Allocate Amount</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`allocation-${goal.id}`}
                              type="number"
                              placeholder="0"
                              value={allocation || ""}
                              onChange={(e) => handleAllocationChange(goal.id, e.target.value)}
                              className="flex-1"
                              max={maxPossible}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMaxAllocation(goal.id)}
                              disabled={maxPossible <= 0}
                            >
                              Max
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Max available: ${maxPossible.toLocaleString()}</p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>New Amount: ${(goal.current + allocation).toLocaleString()}</span>
                              <span>Remaining: ${(goal.target - goal.current - allocation).toLocaleString()}</span>
                            </div>
                            <Progress value={newProgress} className="mb-1" />
                            <p className="text-xs text-right text-orange-500">{Math.round(newProgress)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          {/* Collaborative Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Collaborative Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals
                .filter((goal) => goal.type === "collaborative")
                .map((goal) => {
                  const allocation = allocations[goal.id] || 0
                  const newProgress = getNewProgress(goal)
                  const maxPossible = Math.min(remainingSavings + allocation, goal.target - goal.current)

                  return (
                    <div key={goal.id} className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-gray-600">
                            {goal.daysLeft} Days Left ({goal.date})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Current: ${goal.current.toLocaleString()}</span>
                          <span>Target: ${goal.target.toLocaleString()}</span>
                        </div>

                        <Progress value={goal.progress} className="mb-2" />

                        {/* Contributors */}
                        <div className="space-y-2">
                          {goal.contributors?.map((contributor, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${contributor.color}`} />
                                <span className="text-sm font-medium">{contributor.name}</span>
                              </div>
                              <span className="text-sm">${contributor.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`allocation-${goal.id}`}>Your Allocation</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`allocation-${goal.id}`}
                              type="number"
                              placeholder="0"
                              value={allocation || ""}
                              onChange={(e) => handleAllocationChange(goal.id, e.target.value)}
                              className="flex-1"
                              max={maxPossible}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMaxAllocation(goal.id)}
                              disabled={maxPossible <= 0}
                            >
                              Max
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Max available: ${maxPossible.toLocaleString()}</p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Your Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Your Total: ${(1000 + allocation).toLocaleString()}</span>
                              <span>Goal Progress: ${(goal.current + allocation).toLocaleString()}</span>
                            </div>
                            <Progress value={newProgress} className="mb-1" />
                            <p className="text-xs text-right text-orange-500">{Math.round(newProgress)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Link href="/goals">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={totalAllocated === 0 || remainingSavings < 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Allocating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Allocate ${totalAllocated.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
