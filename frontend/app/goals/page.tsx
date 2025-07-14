"use client"

import { useState, useEffect} from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Info, Plus, X } from "lucide-react"
import { AddGoalForm } from "../_components/forms/add-goal-form"
import { Badge } from "@/app/_components/ui/badge"
import Link from "next/link"

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
}

export default function GoalsPage() {
  
  const CategoryBadge = ({ category }: { category: string }) => (
  <Badge className={`${getCategoryColor(category)} text-xs px-3 py-1 min-w-[70px] text-center font-medium justify-center flex items-center`}>
    {getCategoryLabel(category)}
  </Badge>
)

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant={status === 'completed' ? 'default' : 'secondary'} 
          className="text-xs px-3 py-1 min-w-[80px] text-center font-medium capitalize justify-center flex items-center">
      {status}
    </Badge>
  )
  
  const [showForm, setShowForm] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async() => {
      try {

        console.log('Attempting to fetch from:', 'http://localhost:5100/api/goals/') // Debug log
        
        const response = await fetch('http://localhost:5100/api/goals/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          throw new Error(`Failed to fetch goals: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Fetched goals data:', data)
        setGoals(Array.isArray(data) ? data : [])

      } catch (error: any) {
        console.error("Error fetching goals:", error.message || error)
      } finally {
        setLoading(false);
      }
    }
      fetchGoals()
    }, [])

    const personalGoals = goals.filter(goal => !goal.isCollaborative)
    const collaborativeGoals = goals.filter(goal => goal.isCollaborative)


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

    const calculateProgress = (current: number, amount:number) => {
      return Math.round((current / amount) * 100)
    }
  

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
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading goals...</p>
        </div>
      </MainLayout>
    )
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
                    <p className="text-2xl font-bold text-orange-500">$7,783.00</p> {/* TODO: replace with actual data */}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Month's Saving</p>
                    <p className="text-2xl font-bold text-gray-600">$1,187.40</p> {/* TODO: replace with actual data */}
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
              {personalGoals.length === 0 ? ( 
                <div className="text-center py-8">
                  <p className="text-gray-500">No personal goals found. Start by adding a new goal!</p>
                </div>
              ) : (
                personalGoals.map((goal) => {
                  const daysLeft = getDaysLeft(goal.target_date)
                  const currentAmount = 0;
                  const calculatedProgress = Math.round((currentAmount / goal.amount) * 100)

                  return (
                    <div key={goal.goal_id} className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <CategoryBadge category={goal.category} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base leading-tight">{goal.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {daysLeft} Days Left ({formatDate(goal.target_date)})
                          </p>
                          {goal.description && (
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{goal.description}</p>
                          )}
                        </div>
                        <StatusBadge status={goal.status} />
                      </div>
                      <div className="flex justify-between items-center mb-3 mt-4">
                        <span className="font-semibold text-base">${currentAmount.toLocaleString()}</span>
                        <span className="text-gray-600 text-base font-medium">${goal.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-orange-500 font-medium mb-3">{calculatedProgress}%</div>
                    </div>
                  )
                })
              )} {/* ADDED: Missing closing parenthesis and brace */}
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
              {collaborativeGoals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No collaborative goals found. Start by creating a collaborative goal!</p>
                </div>
              ) : (
              collaborativeGoals.map((goal) => {
                const daysLeft = getDaysLeft(goal.target_date)
                const currentAmount = 0; // TODO later
                const calculatedProgress = Math.round((currentAmount / goal.amount) * 100)
                
                return (
                  <div key={goal.goal_id} className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CategoryBadge category={goal.category} />
                      <div className="flex-1">

                        <h4 className="font-semibold text-base leading-tight">{goal.title}</h4>
                    
                        <p className="text-sm text-gray-600 mt-1">
                          {daysLeft} Days Left ({formatDate(goal.target_date)})
                        </p>

                        {goal.description && (
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{goal.description}</p>
                        )}
                      </div>
                      <StatusBadge status={goal.status} />
                    </div>
                    <div className="flex justify-between items-center mb-3 mt-4">
                      <span className="font-semibold text-base">${currentAmount.toLocaleString()}</span>
                      <span className="text-gray-600 text-base font-medium">${goal.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-orange-500 font-medium mb-3">{calculatedProgress}%</div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Your contribution:</span>
                        <span className="text-sm font-medium">${currentAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              }) 
            )}
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
