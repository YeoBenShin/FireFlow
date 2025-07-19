"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Progress } from "@/app/_components/ui/progress"
import { Car, Plane, Home, ArrowLeft, Check, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Goal {
    goal_id: number; // Supabase generates this UUID
    title: string;
    category: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    amount: number;
    target_date: string; // ISO string format 'YYYY-MM-DD'
    user_id: string; // User ID of the owner
    current_amount: number; // Current allocated amount (now required)
    participantCount: number; // Number of participants (now required)
    userRole: 'owner' | 'collaborator' | 'pending'; // User's role in this goal
  }

interface SavingsData {
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
  const [token, setToken] = useState<string | null>(null)

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0)
  const remainingSavings = (savingsData?.availableSavings || 0) - totalAllocated

// Update your useEffect to fetch current amounts separately

useEffect(() => {
  const incomingToken = localStorage.getItem("authToken");
  setToken(incomingToken);

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch goals using the same endpoint as before (getAllGoals)
      const goalsResponse = await fetch('https://fireflow-m0z1.onrender.com/api/goals', {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!goalsResponse.ok) throw new Error('Failed to fetch goals')
      const goalsData = await goalsResponse.json()
      
      // Fetch savings data
      let savingsData = null
      try {
        const savingsResponse = await fetch('https://fireflow-m0z1.onrender.com/api/users/savings', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (savingsResponse.ok) {
          savingsData = await savingsResponse.json()
        } else {
          savingsData = { availableSavings: 5000 }
        }
      } catch (savingsError) {
        console.warn('Savings endpoint not available, using default')
        savingsData = { availableSavings: 5000 }
      }
      
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

  // Update handleMaxAllocation function:
  const handleMaxAllocation = (goalId: string) => {
    const goal = goals.find((g) => g.goal_id.toString() === goalId) // Changed from g.id to g.goal_id.toString()
    if (goal && savingsData) {
      const maxPossible = Math.min(
        remainingSavings + (allocations[goalId] || 0), 
        goal.amount - (goal.current_amount || 0) // Changed from goal.target to goal.amount
      )
      setAllocations((prev) => ({
        ...prev,
        [goalId]: maxPossible,
      }))
    }
  }

  // Update handleSubmit to make real API call:
  const handleSubmit = async () => {
    if (!savingsData) return

    // Check for excessive allocations before submitting
    const excessiveAllocations = Object.entries(allocations).filter(([goalId, amount]) => {
      const goal = goals.find(g => g.goal_id.toString() === goalId)
      return goal && amount > (goal.amount - goal.current_amount)
    })

    if (excessiveAllocations.length > 0) {
      const goalTitles = excessiveAllocations.map(([goalId]) => {
        const goal = goals.find(g => g.goal_id.toString() === goalId)
        return goal?.title || goalId
      }).join(', ')

      const confirmed = confirm(
        `Warning: You're allocating more than needed for: ${goalTitles}. ` +
        `This may result in over-funding these goals. Do you want to proceed?`
      )

      if (!confirmed) return
    }

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
      
      const response = await fetch('https://fireflow-m0z1.onrender.com/api/goals/allocate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ allocations: validAllocations }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Allocations completed successfully", result)

      // Show success message with completed goals if any
      if (result.completedGoals && result.completedGoals.length > 0) {
        const completedGoalTitles = result.completedGoals.map((goalId: number) => {
          const goal = goals.find(g => g.goal_id === goalId)
          return goal?.title || `Goal ${goalId}`
        }).join(', ')
        
        alert(`🎉 Congratulations! You've completed: ${completedGoalTitles}`)
      }

      router.push("/goals")
    } catch (err) {
      console.error('Error allocating funds:', err)
      setError(err instanceof Error ? err.message : 'Failed to allocate funds')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update getNewProgress function:
  const getNewProgress = (goal: Goal) => {
    const allocation = allocations[goal.goal_id.toString()] || 0
    const newCurrent = goal.current_amount + allocation
    return (newCurrent / goal.amount) * 100
  }

  // Update handleAllocationChange with gentle validation
  const handleAllocationChange = (goalId: string, value: string) => {
    const amount = Number.parseFloat(value) || 0
    const goal = goals.find(g => g.goal_id.toString() === goalId)
    
    if (goal) {
      // Clear previous error for this goal
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[goalId]
        return newErrors
      })
      
      // Only show warning for excessive amounts, don't block input
      const remainingNeeded = goal.amount - goal.current_amount
      if (amount > goal.amount) {
        setValidationErrors(prev => ({
          ...prev,
          [goalId]: `This exceeds the total goal amount of $${goal.amount.toLocaleString()}`
        }))
      } else if (amount > remainingNeeded) {
        setValidationErrors(prev => ({
          ...prev,
          [goalId]: `Only $${remainingNeeded.toLocaleString()} needed to complete this goal`
        }))
      }
    }
    
    setAllocations((prev) => ({
      ...prev,
      [goalId]: amount,
    }))
  }

    // Add these helper functions after your handlers

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
 // Filter goals
  const personalGoals = goals.filter(goal => 
    goal.participantCount <= 1 && goal.userRole !== 'pending' && goal.status !== 'completed'
  )
  const collaborativeGoals = goals.filter(goal => 
    goal.participantCount > 1 && goal.userRole !== 'pending' && goal.status !== 'completed'
  )
  const completedGoals = goals.filter(goal => goal.status === 'completed')

  const calculateDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

    // Add before your main return statement

  // Loading state
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

  // Error state
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
                  const currentAmount = goal.current_amount
                  const newProgress = ((currentAmount + allocation) / goal.amount) * 100
                  const currentProgress = (currentAmount / goal.amount) * 100
                  const maxPossible = Math.min(
                    remainingSavings + allocation, 
                    goal.amount - currentAmount
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
                          <span>Current: ${currentAmount.toLocaleString()}</span>
                          <span>Target: ${goal.amount.toLocaleString()}</span>
                        </div>

                        <Progress value={currentProgress} className="mb-2" />

                        <div className="space-y-2">
                          <Label>Allocate Amount</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`allocation-${goalId}`}
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
                          {validationErrors[goalId] && (
                            <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                              <span>⚠️</span>
                              {validationErrors[goalId]}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Max available: ${maxPossible.toLocaleString()}
                          </p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>
                                New Amount: ${(currentAmount + allocation).toLocaleString()}
                              </span>
                              <span>
                                Remaining: ${(goal.amount - currentAmount - allocation).toLocaleString()}
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
                <CardTitle className="text-xl">Collaborative Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {collaborativeGoals.map((goal) => {
                  const goalId = goal.goal_id.toString()
                  const allocation = allocations[goalId] || 0
                  const currentAmount = goal.current_amount
                  const newProgress = ((currentAmount + allocation) / goal.amount) * 100
                  const currentProgress = (currentAmount / goal.amount) * 100
                  const maxPossible = Math.min(
                    remainingSavings + allocation, 
                    goal.amount - currentAmount
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
                          <span>Current: ${currentAmount.toLocaleString()}</span>
                          <span>Target: ${goal.amount.toLocaleString()}</span>
                        </div>

                        <Progress value={currentProgress} className="mb-2" />

                        <div className="space-y-2">
                          <Label>Your Allocation</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`allocation-${goalId}`}
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
                          {validationErrors[goalId] && (
                            <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                              <span>⚠️</span>
                              {validationErrors[goalId]}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Max available: ${maxPossible.toLocaleString()}
                          </p>
                        </div>

                        {allocation > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">After Your Allocation:</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>
                                New Amount: ${(currentAmount + allocation).toLocaleString()}
                              </span>
                              <span>
                                Goal Progress: ${(goal.amount - currentAmount - allocation).toLocaleString()}
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

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Completed Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedGoals.map((goal) => {
                const currentAmount = goal.current_amount
                const currentProgress = (currentAmount / goal.amount) * 100

                return (
                  <div key={goal.goal_id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800">{goal.title}</h4>
                        <p className="text-sm text-green-600">
                          Completed • {formatDate(goal.target_date)}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Achieved: ${currentAmount.toLocaleString()}</span>
                        <span>Target: ${goal.amount.toLocaleString()}</span>
                      </div>
                      <Progress value={100} className="bg-green-100" />
                      <p className="text-xs text-right text-green-600">
                        100% Complete 🎉
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* No Goals Message */}
        {(personalGoals.length === 0 && collaborativeGoals.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {goals.length === 0 ? 'No Goals Found' : 'No Active Goals to Allocate'}
              </h3>
              <p className="text-gray-600 mb-4">
                {goals.length === 0 
                  ? "You haven't created any goals yet. Create some goals to start allocating your savings!"
                  : "All your goals are either completed or pending. Create new goals to continue saving!"
                }
              </p>
              <Link href="/goals">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  {goals.length === 0 ? 'Create Your First Goal' : 'View All Goals'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {(personalGoals.length > 0 || collaborativeGoals.length > 0) && (
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
