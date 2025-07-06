"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Textarea } from "@/app/_components/ui/textarea"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddRecurringFormProps {
  onClose?: () => void
  onSuccess?: () => void
}

export function AddRecurringForm({ onClose, onSuccess }: AddRecurringFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Changed to proper date format
    enddate:  new Date().toISOString().split('T')[0], // Changed to proper date format
    frequency: "monthly" as "daily" | "weekly" | "biweekly" | "bimonthly" | "monthly" | "yearly",
    type: "expense" as "income" | "expense",
    category: "",
    
    amount: "25.00",
    title: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Helper function to calculate repeatDay based on date and frequency
  const calculateRepeatDay = (date: string, frequency: string): string => {
    const selectedDate = new Date(date)
    
    switch (frequency) {
      case 'daily':
        return 'daily'
      case 'weekly':
      case 'biweekly':
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        return days[selectedDate.getDay()]
      case 'monthly':
      case 'bimonthly':
        return selectedDate.getDate().toString()
      case 'yearly':
        return selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      default:
        return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // const token = localStorage.getItem("authToken")
      
      // if (!token) {
      //   setError("No authentication token found. Please login.")
      //   setIsSubmitting(false)
      //   return
      // }

      // Calculate repeatDay based on selected date and frequency
      const repeatDay = calculateRepeatDay(formData.date, formData.frequency)

      // Prepare the request body to match your backend schema
      const requestBody = {
        description: formData.title,
        type: formData.type,
        amount: parseFloat(formData.amount.replace(/[^0-9.]/g, "")),
        category: formData.category,
        frequency: formData.frequency,
        repeatDay: repeatDay,
        endDate: formData.enddate, // Optional field
        isActive: true,
      }

      console.log('Sending request to backend:', requestBody)

      const response = await fetch('http://localhost:5100/api/recurring-transactions/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Recurring transaction created successfully:', result)

      // Reset form data
      setFormData({
        date: new Date().toISOString().split('T')[0],
        frequency: "monthly",
        type: "expense",
        category: "",
        amount: "25.00",
        title: "",
        notes: "",
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      } else if (onClose) {
        onClose()
      }

      // Refresh the page to simulate data update
      router.refresh()

    } catch (err) {
      console.error('Error creating recurring transaction:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while creating the recurring transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="date">Start Date</Label>
        <div className="relative">
          <Input 
            id="date" 
            type="date"
            value={formData.date} 
            onChange={handleChange} 
            className="bg-orange-50"
            required
          />
          
        </div>
      </div>

      <div>
        <Label htmlFor="date">End Date</Label>
        <div className="relative">
          <Input 
            id="enddate" 
            type="date"
            value={formData.enddate} 
            onChange={handleChange} 
            className="bg-orange-50"
            required
          />
          
        </div>
      </div>

      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
          <SelectTrigger className="bg-teal-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Bi-weekly</SelectItem>
            <SelectItem value="bimonthly">Bi-monthly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
          <SelectTrigger className="bg-teal-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
          <SelectTrigger className="bg-teal-50">
            <SelectValue placeholder="Select The Category..." />
          </SelectTrigger>
          <SelectContent>
            Expenses
            <SelectItem value="food">Food & Dining</SelectItem>
            <SelectItem value="transport">Transportation</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="health">Health & Fitness</SelectItem>
            Income
            <SelectItem value="salary">Salary</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          value={`$${formData.amount}`}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "")
            setFormData((prev) => ({ ...prev, amount: value }))
          }}
          className="bg-teal-50"
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Subscription"
          className="bg-teal-50"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter Message"
          className="bg-teal-50 min-h-[100px] resize-none"
        />
      </div>

      <div className="flex gap-2 mt-6">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-orange-500 hover:bg-orange-600"
          disabled={!formData.category || !formData.title || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}