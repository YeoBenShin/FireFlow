"use client"

import { useState } from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Plus, X } from "lucide-react"
import { AddRecurringForm } from "../_components/forms/add-recurring-form"
import { Badge } from "@/app/_components/ui/badge"

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false)

  const recurringExpenses = [
    {
      id: "1",
      title: "Gym Membership",
      frequency: "Every 1st Of The Month",
      amount: -98.9,
      category: "health",
    },
    {
      id: "2",
      title: "MRT Concession",
      frequency: "Every 15th Of The Month",
      amount: -48.0,
      category: "transport",
    },
    {
      id: "3",
      title: "Spotify",
      frequency: "Every 12th Of The Month",
      amount: -12.8,
      category: "entertainment",
    },
  ]

  const recurringIncome = [
    {
      id: "4",
      title: "Monthly Salary",
      frequency: "Every 1st Of The Month",
      amount: 3000.8,
      category: "salary",
    },
    {
      id: "5",
      title: "Private Coaching",
      frequency: "Every Week, Monday",
      amount: 75,
      category: "freelance",
    },
    {
      id: "6",
      title: "John's Math Tuition",
      frequency: "Every Week, Tuesday",
      amount: 90,
      category: "freelance",
    },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "bg-green-100 text-green-800",
      transport: "bg-blue-100 text-blue-800",
      entertainment: "bg-purple-100 text-purple-800",
      utilities: "bg-yellow-100 text-yellow-800",
      food: "bg-orange-100 text-orange-800",
      salary: "bg-emerald-100 text-emerald-800",
      freelance: "bg-teal-100 text-teal-800",
      investment: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      health: "Health & Fitness",
      transport: "Transportation",
      entertainment: "Entertainment",
      utilities: "Utilities",
      food: "Food & Dining",
      salary: "Salary",
      freelance: "Freelance",
      investment: "Investment",
      other: "Other",
    }
    return labels[category as keyof typeof labels] || "Other"
  }

  const handleCloseForm = () => {
    setShowForm(false)
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen">
        {/* Recurring Items Section - Fixed width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recurring Items</CardTitle>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Recurring Item
              </Button>
            </CardHeader>
            <CardContent>
              {/* Recurring Expenditure */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 underline">Recurring Expenditure</h3>
                <div className="space-y-3">
                  {recurringExpenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Badge>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.frequency}</p>
                        </div>
                      </div>
                      <span className="font-bold text-red-600">${Math.abs(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Income */}
              <div>
                <h3 className="font-semibold text-lg mb-4 underline">Recurring Income</h3>
                <div className="space-y-3">
                  {recurringIncome.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Badge>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.frequency}</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">+${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Shows form when active, summary when not */}
        <div className="lg:col-span-1">
          {showForm ? (
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Add Recurring Item</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseForm} className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <AddRecurringForm onClose={handleCloseForm} />
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Recurring Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">Monthly Expenses</h4>
                  <p className="text-2xl font-bold text-red-600">
                    -${recurringExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{recurringExpenses.length} recurring expenses</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Monthly Income</h4>
                  <p className="text-2xl font-bold text-green-600">
                    +${recurringIncome.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{recurringIncome.length} recurring income sources</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-700 mb-2">Net Monthly Flow</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    $
                    {(
                      recurringIncome.reduce((sum, item) => sum + item.amount, 0) -
                      recurringExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0)
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Available for goals & savings</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recurring Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
