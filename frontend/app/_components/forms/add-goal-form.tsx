"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Textarea } from "@/app/_components/ui/textarea"
import { Calendar, Users } from "lucide-react"
import { Switch } from "@/app/_components/ui/switch"
import { useRouter } from "next/navigation"

export function AddGoalForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    targetDate: "",
    amount: "",
    category: "",
    isCollaborative: false,
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isCollaborative: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const goalData = {
      title: formData.title.trim(),
      description: formData.notes.trim() || null, 
      category: formData.category,
      target_date: formData.targetDate, 
      amount: parseFloat(formData.amount.replace(/[^0-9.]/g, '')), 
      status: 'pending',
      isCollaborative: formData.isCollaborative,
    }

      // Send POST request to create the goal
      const response = await fetch('http://localhost:5100/api/goals/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })

      if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error("Error response:", errorData);
      } catch (parseError) {
        console.error("Failed to parse error response");
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Goal created successfully:", result);


      // Reset form data
      setFormData({
        title: "",
        targetDate: "",
        amount: "",
        category: "",
        isCollaborative: false,
        notes: "",
      })

      if (onClose) onClose()

      // Refresh the page to simulate data update
      router.refresh()
    } catch (error: any) {
    console.error("Error creating goal:", error)
    alert(`Failed to create goal: ${error.message}`)
    } finally {
    setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div>
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., New Car, Vacation, etc."
          className="bg-teal-50"
        />
      </div>

      <div>
        <Label htmlFor="targetDate">Target Date</Label>
        <div className="relative">
          <Input
            id="targetDate"
            type= "date"
            value={formData.targetDate}
            onChange={handleChange}
            placeholder="Select a date"
            className="bg-orange-50"
          />
          </div>
      </div>

      <div>
        <Label htmlFor="amount">Target Amount</Label>
        <Input
          id="amount"
          value={formData.amount ? `$${formData.amount}` : ""}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "")
            setFormData((prev) => ({ ...prev, amount: value }))
          }}
          placeholder="$0.00"
          className="bg-teal-50"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
          <SelectTrigger className="bg-teal-50">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <Label htmlFor="collaborative">Collaborative Goal</Label>
        </div>
        <Switch id="collaborative" checked={formData.isCollaborative} onCheckedChange={handleSwitchChange} />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add details about your goal"
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
          disabled={!formData.title || !formData.amount || !formData.category || isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  )
}
