"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Plus, X } from "lucide-react"
import { AddRecurringForm } from "../_components/forms/add-recurring-form"
import { Badge } from "@/app/_components/ui/badge"

interface BackendRecurringTransaction {
  rec_trans_id: number
  description: string
  type: 'income' | 'expense'
  amount: number
  category: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'bimonthly' | 'monthly' | 'yearly'
  repeatDay: string
  endDate?: string
  isActive: boolean
  userId: string
}

interface DisplayRecurringTransaction {
  id: string
  title: string
  frequency: string
  amount: number
  category: string
  type: 'income' | 'expense'
  isActive: boolean
}

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false)
  const [recurringExpenses, setRecurringExpenses] = useState<DisplayRecurringTransaction[]>([])
  const [recurringIncome, setRecurringIncome] = useState<DisplayRecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecurringTransactions()
  }, [])

 const fetchRecurringTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:5100/api/recurring-transactions', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const backendTransactions: BackendRecurringTransaction[] = await response.json()
      
      console.log('Backend response:', backendTransactions)

      if (!backendTransactions || backendTransactions.length === 0) {
      console.log('No transactions found')
      setRecurringExpenses([])
      setRecurringIncome([])
      return
    }
      // Transform backend data to frontend format
      const displayTransactions: DisplayRecurringTransaction[] = backendTransactions.map(transaction => {
      // Check if transaction has the expected properties
      if (!transaction || typeof transaction !== 'object') {
        console.warn('Invalid transaction object:', transaction)
        return null
      }

      return {
        id: transaction.rec_trans_id?.toString() || 'unknown',
        title: transaction.description || 'No description',
        frequency: formatFrequency(transaction.frequency || 'monthly', transaction.repeatDay || ''),
        amount: transaction.amount || 0,
        category: transaction.category || 'other',
        type: transaction.type || 'expense',
        isActive: transaction.isActive !== undefined ? transaction.isActive : true
      }
    }).filter(transaction => transaction !== null) as DisplayRecurringTransaction[]

      // Filter active transactions and separate by type
      const activeTransactions = displayTransactions.filter(t => t.isActive)
      setRecurringExpenses(activeTransactions.filter(t => t.type === 'expense'))
      setRecurringIncome(activeTransactions.filter(t => t.type === 'income'))

    } catch (error) {
      console.error("Error fetching recurring transactions:", error)
      setError("Failed to load recurring transactions. Please try again later.")
    } finally {
      setLoading(false)
    }
 }
      

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


  const formatFrequency = (frequency: string, repeatDay: string): string => {
    const dayMap: { [key: string]: string } = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    }

    switch (frequency) {
      case 'daily':
        return 'Every Day'
      case 'weekly':
        return `Every Week, ${dayMap[repeatDay.toLowerCase()] || repeatDay}`
      case 'biweekly':
        return `Every 2 Weeks, ${dayMap[repeatDay.toLowerCase()] || repeatDay}`
      case 'monthly':
        return `Every ${repeatDay} Of The Month`
      case 'bimonthly':
        return `Every 2 Months, ${repeatDay}`
      case 'yearly':
        return `Every Year, ${repeatDay}`
      default:
        return `Every ${frequency}`
    }
  }

  
  const getCategoryLabel = (category: string) => {
    const labels = {
      health: "Health & Fitness",
      transport: "Transport",
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
    // Refresh data after closing form
    fetchRecurringTransactions()
  }

  const handleAddSuccess = () => {
    setShowForm(false)
    // Refresh data after successful add
    fetchRecurringTransactions()
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
                  {recurringExpenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recurring expenses found</p>
                  ) : (
                    recurringExpenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`min-w-[100px] text-center flex items-center justify-center ${getCategoryColor(item.category)}`}>
                            {getCategoryLabel(item.category)}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.frequency}</p>
                          </div>
                        </div>
                        <span className="font-bold text-red-600">${Math.abs(item.amount).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recurring Income */}
              <div>
                <h3 className="font-semibold text-lg mb-4 underline">Recurring Income</h3>
                <div className="space-y-3">
                  {recurringIncome.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recurring income found</p>
                  ) : (
                    recurringIncome.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`min-w-[100px] text-center flex items-center justify-center ${getCategoryColor(item.category)}`}>
                            {getCategoryLabel(item.category)}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.frequency}</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">+${item.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
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
                {/* Fix: Add onSuccess prop */}
                <AddRecurringForm onClose={handleCloseForm} onSuccess={handleAddSuccess} />
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
                    <Button variant="outline" className="w-full" onClick={fetchRecurringTransactions}>
                      Refresh Data
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