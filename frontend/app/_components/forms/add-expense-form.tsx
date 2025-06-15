"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const expenseCategories = [
  { id: "food", name: "Food & Dining" },
  { id: "transport", name: "Transportation" },
  { id: "medicine", name: "Medicine & Health" },
  { id: "groceries", name: "Groceries" },
  { id: "rent", name: "Rent & Housing" },
  { id: "gifts", name: "Gifts" },
  { id: "savings", name: "Savings" },
  { id: "entertainment", name: "Entertainment" },
  { id: "utilities", name: "Utilities" },
  { id: "shopping", name: "Shopping" },
  { id: "education", name: "Education" },
  { id: "other", name: "Other" },
]

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
})

export function AddExpenseForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      date: "April 30, 2024",
      amount: "25.00",
      title: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate adding the expense
    setTimeout(() => {
      console.log("Expense added:", {
        ...values,
        amount: Number.parseFloat(values.amount.replace("$", "")),
        type: "expense",
      })

      setIsSubmitting(false)
      if (onClose) onClose()

      // Refresh the page to simulate data update
      router.refresh()
    }, 500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-teal-50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} className="bg-orange-50" />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  value={`$${field.value}`}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    field.onChange(value)
                  }}
                  className="bg-teal-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter expense title" className="bg-teal-50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter Message" className="bg-teal-50 min-h-[100px] resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 mt-6"
          disabled={!form.formState.isValid || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
}
