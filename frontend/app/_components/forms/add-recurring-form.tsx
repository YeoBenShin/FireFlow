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

export function AddRecurringForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: "April 30, 2024",
    frequency: "monthly",
    type: "expense",
    category: "",
    amount: "25.00",
    title: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate adding the recurring item
    setTimeout(() => {
      console.log("Recurring item added:", {
        ...formData,
        amount: Number.parseFloat(formData.amount.replace("$", "")),
      })

      setIsSubmitting(false)

      // Reset form data
      setFormData({
        date: "April 30, 2024",
        frequency: "monthly",
        type: "expense",
        category: "",
        amount: "25.00",
        title: "",
        notes: "",
      })

      if (onClose) onClose()

      // Refresh the page to simulate data update
      router.refresh()
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div>
        <Label htmlFor="date">Start Date</Label>
        <div className="relative">
          <Input id="date" value={formData.date} onChange={handleChange} className="bg-orange-50" />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
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
            <SelectItem value="food">Food & Dining</SelectItem>
            <SelectItem value="transport">Transportation</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="income">Income</SelectItem>
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
