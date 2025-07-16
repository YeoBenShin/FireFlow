"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Progress } from "@/app/_components/ui/progress"
import { Car, Plane, Home, ArrowLeft, Check, DollarSign, Users } from "lucide-react"
import Link from "next/link"

interface Goal {
  goal_id: number
  title: string
  category: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  amount: number
  current_amount: number
  target_date: string
  isCollaborative: boolean
  user_id: string
}

interface SavingsData {
  totalIncome: number
  totalExpenses: number
  totalAllocatedToGoals: number
  availableSavings: number
}

export default function AllocatePage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null)
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch goals and savings data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch goals
        const goalsResponse = await fetch('http://localhost:5100/api/goals', {
          credentials: 'include'
        })
        if (!goalsResponse.ok) throw new Error('Failed to fetch goals')
        const goalsData = await goalsResponse.json()
        
        // Fetch savings data
        const savingsResponse = await fetch('http://localhost:5100/api/users/savings', {
          credentials: 'include'
        })
        if (!savingsResponse.ok) throw new Error('Failed to fetch savings data')
        const savingsData = await savingsResponse.json()
        
        setGoals(goalsData)
        setSavingsData(savingsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0)
  const remainingSavings = (savingsData?.availableSavings || 0) - totalAllocated

  const handleAllocationChange = (goalId: string, value: string) => {
    const amount = Number.parseFloat(value) || 0
    setAllocations((prev) => ({
      ...prev,
      [goalId]: amount,
    }))
  }

  const handleMaxAllocation = (goalId: string) => {
    const goal = goals.find((g) => g.goal_id.toString() === goalId)
    if (goal && savingsData) {
      const maxPossible = Math.min(
        remainingSavings + (allocations[goalId] || 0), 
        goal.amount - (goal.current_amount || 0)
      )
      setAllocations((prev) => ({
        ...prev,
        [goalId]: maxPossible,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!savingsData) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      // Filter out zero allocations
      const validAllocations = Object.fromEntries(
        Object.entries(allocations).filter(([_, amount]) => amount > 0)
      )

      if (Object.keys(validAllocations).length === 0) {
        throw new Error('Please allocate at least some amount to one goal')
      }

      const response = await fetch('http://localhost:5100/api/goals/allocate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocations: validAllocations }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      console.log("Allocations completed successfully")
      router.push("/goals")
    } catch (err) {
      console.error('Error allocating funds:', err)
      setError(err instanceof Error ? err.message : 'Failed to allocate funds')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNewProgress = (goal: Goal) => {
    const allocation = allocations[goal.goal_id.toString()] || 0
    const newCurrent = (goal.current_amount || 0) + allocation
    return (newCurrent / goal.amount) * 100
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'car':
      case 'transport':
        return <Car className="w-5 h-5" />
      case 'travel':
        return <Plane className="w-5 h-5" />
      case 'home':
        return <Home className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const calculateDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your goals and savings...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const personalGoals = goals.filter(goal => !goal.isCollaborative)
  const collaborativeGoals = goals.filter(goal => goal.isCollaborative)

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

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Available Savings Summary */}
        {savingsData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Available Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Available</p>
                  <p className="text-3xl font-bold text-orange-500">
                    ${savingsData.availableSavings.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">To Allocate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${totalAllocated.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${remainingSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Goals */}
          {personalGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Personal Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {personalGoals.map((goal) => {
                  const goalId = goal.goal_id.toString()
                  const allocation = allocations[goalId] || 0
                  const newProgress = getNewProgress(goal)
                  const currentProgress = ((goal.current_amount || 0) / goal.amount) * 100
                  const maxPossible = Math.min(
                    remainingSavings + allocation, 
                    goal.amount - (goal.current_amount || 0)
                  )
                  const daysLeft = calculateDaysLeft(goal.target_date)

                  return (
                    <div key={goal.goal_id} className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-gray-600">
                            {daysLeft} Days Left ({formatDate(goal.target_date)})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Current: ${(goal.current_amount || 0).toLocaleString()}</span>
                          <span>Target: ${goal.amount.toLocaleString()}</span>
                        </div>

                        <Progress value={currentProgress} className="mb-2" />

                        <div className="space-y-2">
                          <Label>Allocate Amount</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={allocation || ""}
                              onChange={(e) => handleAllocationChange(goalId, e.target.value)}
                              className="flex-1"
                              max={maxPossible}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMaxAllocation(goalId)}
                              disabled={maxPossible <= 0}
                            >
                              Max
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Max available: ${maxPossible.toLocaleString()}
                          </p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>
                                New Amount: ${((goal.current_amount || 0) + allocation).toLocaleString()}
                              </span>
                              <span>
                                Remaining: ${(goal.amount - (goal.current_amount || 0) - allocation).toLocaleString()}
                              </span>
                            </div>
                            <Progress value={newProgress} className="mb-1" />
                            <p className="text-xs text-right text-orange-500">
                              {Math.round(newProgress)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Collaborative Goals */}
          {collaborativeGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collaborative Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {collaborativeGoals.map((goal) => {
                  const goalId = goal.goal_id.toString()
                  const allocation = allocations[goalId] || 0
                  const newProgress = getNewProgress(goal)
                  const currentProgress = ((goal.current_amount || 0) / goal.amount) * 100
                  const maxPossible = Math.min(
                    remainingSavings + allocation, 
                    goal.amount - (goal.current_amount || 0)
                  )
                  const daysLeft = calculateDaysLeft(goal.target_date)

                  return (
                    <div key={goal.goal_id} className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-gray-600">
                            {daysLeft} Days Left ({formatDate(goal.target_date)})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Current: ${(goal.current_amount || 0).toLocaleString()}</span>
                          <span>Target: ${goal.amount.toLocaleString()}</span>
                        </div>

                        <Progress value={currentProgress} className="mb-2" />

                        <div className="space-y-2">
                          <Label>Your Allocation</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={allocation || ""}
                              onChange={(e) => handleAllocationChange(goalId, e.target.value)}
                              className="flex-1"
                              max={maxPossible}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMaxAllocation(goalId)}
                              disabled={maxPossible <= 0}
                            >
                              Max
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Max available: ${maxPossible.toLocaleString()}
                          </p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Your Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>
                                Goal Progress: ${((goal.current_amount || 0) + allocation).toLocaleString()}
                              </span>
                              <span>
                                Remaining: ${(goal.amount - (goal.current_amount || 0) - allocation).toLocaleString()}
                              </span>
                            </div>
                            <Progress value={newProgress} className="mb-1" />
                            <p className="text-xs text-right text-orange-500">
                              {Math.round(newProgress)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* No Goals Message */}
        {goals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any goals yet. Create some goals to start allocating your savings!
              </p>
              <Link href="/goals">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Create Your First Goal
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {goals.length > 0 && (
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
        )}
      </div>
    </MainLayout>
  )
}
