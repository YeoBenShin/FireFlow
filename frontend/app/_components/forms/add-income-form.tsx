"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import {
  DollarSign,
  ShoppingBag,
  Home,
  Bus,
  Utensils,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
// import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const incomeCategories = [
  { id: "salary", name: "Salary" },
  { id: "freelance", name: "Freelance" },
  { id: "tutoring", name: "Tutoring" },
  { id: "investment", name: "Investment Returns" },
  { id: "bonus", name: "Bonus" },
  { id: "rental", name: "Rental Income" },
  { id: "business", name: "Business Income" },
  { id: "commission", name: "Commission" },
  { id: "dividend", name: "Dividends" },
  { id: "gift", name: "Gift/Allowance" },
  { id: "other", name: "Other" },
]

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
})

  const iconMap = {
  DollarSign: <DollarSign className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
};

export function AddIncomeForm({
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
      date: "April 30, 2024",
      amount: "",
      title: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    console.log("Form data ready to send:", values) //check in console if the object is really created
    try {
      const payload = {
        ...values,
        date: new Date(values.date).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",}),
        amount: Number.parseFloat(values.amount.replace("$", "")),
        type: "income",
        month: new Date(values.date).toLocaleString("default", { month: "long" }), // e.g., "April"
        icon: "DollarSign", // fallback icon string
      }

      const response = await fetch("/api/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to add income: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Income added:", data)
      const newTx = {
        ...data,
        icon: iconMap[data.icon] || null,
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
                  {incomeCategories.map((category) => (
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
                  <Input {...field} type="date" className="bg-orange-50" />
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
                  value={field.value ? `$${field.value}` : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    field.onChange(value)
                  }}
                  placeholder="$0.00"
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
              <FormLabel>Income Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Income source" className="bg-teal-50" />
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
                <Textarea
                  {...field}
                  placeholder="Enter Message"
                  className="bg-teal-50 min-h-[100px] resize-none"
                />
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
