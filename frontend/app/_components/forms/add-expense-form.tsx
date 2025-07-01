"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
// import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  DollarSign,
  ShoppingBag,
  Home,
  Bus,
  Utensils,
} from "lucide-react"
import { Icon } from "next/dist/lib/metadata/types/metadata-types"

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

type IconName = "DollarSign" | "ShoppingBag" | "Home" | "Bus" | "Utensils";

const categoryIconMap: Record<string, IconName> = {
  food: "Utensils",
  transport: "Bus",
  medicine: "DollarSign", 
  groceries: "ShoppingBag",
  rent: "Home",
  gifts: "ShoppingBag",
  savings: "DollarSign",
  entertainment: "ShoppingBag",
  utilities: "DollarSign",
  shopping: "ShoppingBag",
  education: "DollarSign",
  other: "DollarSign",
}

const iconMap: Record<IconName, JSX.Element> = {
  DollarSign: <DollarSign className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
};

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  dateTime: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Title is required"),
  //notes: z.string().optional(),
})

export function AddExpenseForm({
  onClose,
  onAddTransaction,
}: {
  onClose?: () => void;
  onAddTransaction?: (newTx: any) => void;
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      dateTime: "",
      amount: "0.00",
      description: "",  
      //notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) { 
    setIsSubmitting(true)

    console.log("Form data ready to send:", values) //check in console if the object is really created
    // Simulate adding the expense
     try {
      const payload = {
        ...values,
        // trans_id: Math.floor(Math.random() * 10000), // Simulate unique ID
        dateTime: new Date(values.dateTime).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",}),
        amount: Number.parseFloat(values.amount.replace("$", "")),
        type: "expense",
      }

      // Send POST request to backend
      const response = await fetch("http://localhost:5100/api/transactions/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to add expense: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Expense added:", result)
      const data = result.data;

       const newTx = {
        ...data,
        month: new Date(values.dateTime).toLocaleString("default", { month: "long" }), // e.g., "April"
        icon: iconMap[categoryIconMap[data.category] || "DollarSign"] || null,
      };

      onAddTransaction?.(newTx);

      if (onClose) onClose()
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      // Optionally, show user-friendly error notification here
    } finally {
      setIsSubmitting(false)
    }
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
          name="dateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type = "date" className="bg-orange-50" />
                  {/* <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" /> */}
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
          name="description"
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

        {/* <FormField
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
        /> */}

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
