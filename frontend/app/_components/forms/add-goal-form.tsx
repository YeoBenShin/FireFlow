"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Textarea } from "@/app/_components/ui/textarea"
import { Calendar, Users, UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/app/_components/ui/badge"

interface Friend {
  user_id: string;
  username: string;
  name: string;
}

export function AddGoalForm({ onClose, onGoalCreated }: { onClose?: () => void; onGoalCreated?: () => void }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    targetDate: "",
    amount: "",
    category: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  // Send invitations to selected friends when goal is created
  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    setLoadingFriends(true)
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch('https://fireflow-m0z1.onrender.com/api/friends/for-goals', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token for authentication
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriends(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch friends')
        setFriends([])
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
      setFriends([])
    } finally {
      setLoadingFriends(false)
    }
  }

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const removeFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(id => id !== friendId))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = localStorage.getItem("authToken");

    try {
      const goalData = {
      title: formData.title.trim(),
      description: formData.notes.trim() || null, 
      category: formData.category,
      target_date: formData.targetDate, 
      amount: parseFloat(formData.amount.replace(/[^0-9.]/g, '')), 
      status: 'pending',
      selectedFriends: selectedFriends
    }

      // Send POST request to create the goal
      const response = await fetch('https://fireflow-m0z1.onrender.com/api/goals/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
        targetDate: new Date().toISOString().split("T")[0],
        amount: "",
        category: "",
        notes: "",
      })
      setSelectedFriends([])

      if (onClose) onClose()
      if (onGoalCreated) onGoalCreated() // Trigger refresh

      // Don't need router.refresh() anymore since we're using callback
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
        <Label>Goal Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., New Car, Vacation, etc."
          className="bg-teal-50"
        />
      </div>

      <div>
        <Label>Target Date</Label>
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
        <Label>Target Amount</Label>
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
        <Label>Category</Label>
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <div>
            <Label>Friends to Invite</Label>
            {selectedFriends.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Select friends below to send invitations</p>
            )}
            {selectedFriends.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">Invitations will be sent to selected friends</p>
            )}
          </div>
        </div>
          
          {/* Selected Friends Display */}
          {selectedFriends.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFriends.map(friendId => {
                const friend = friends.find(f => f.user_id === friendId)
                return friend ? (
                  <Badge key={friendId} variant="secondary" className="flex items-center gap-1">
                    {friend.name} (invite pending)
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeFriend(friendId)}
                    />
                  </Badge>
                ) : null
              })}
            </div>
          )}

          {/* Available Friends List */}
          {loadingFriends ? (
            <div className="text-sm text-gray-500">Loading friends...</div>
          ) : friends.length > 0 ? (
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {friends
                .filter(friend => !selectedFriends.includes(friend.user_id))
                .map(friend => (
                <div 
                  key={friend.user_id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => toggleFriendSelection(friend.user_id)}
                >
                  <div>
                    <div className="font-medium text-sm">{friend.name}</div>
                    <div className="text-xs text-gray-500">@{friend.username}</div>
                  </div>
                  <UserPlus className="w-4 h-4 text-gray-400" />
                </div>
              ))}
              {friends.filter(friend => !selectedFriends.includes(friend.user_id)).length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  {selectedFriends.length === friends.length ? "All friends selected" : "No more friends available"}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-3 text-center border rounded-md bg-gray-50">
              No friends found. Add friends first to send collaboration invitations.
            </div>
          )}
      </div>

      <div>
        <Label>Notes</Label>
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
          disabled={
            !formData.title || 
            !formData.amount || 
            !formData.category || 
            isSubmitting
          }
        >
          {isSubmitting ? "Creating Goal & Sending Invites..." : "Create Goal & Send Invites"}
        </Button>
      </div>
    </form>
  )
}
