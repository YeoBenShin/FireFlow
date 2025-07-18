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
  time: z.string().min(1, "Time is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Title is required"),
  // notes: z.string().optional(),
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
      date: new Date().toISOString().split("T")[0],
      time: (() => {
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      })(),
      amount: "",
      description: "",
      //notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    console.log("Form data ready to send:", values) //check in console if the object is really created
    try {
      const dateTime = `${values.date}T${values.time}:00`; 
      const payload = {
        category: values.category,
        description: values.description,
        dateTime: dateTime, // Convert to ISO string
        amount: Number.parseFloat(values.amount.replace("$", "")),
        type: "income",
      }

      const response = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to add income: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Income added:", result)
      const data = result.data
      const newTx = {
        ...data,
        transId: data.trans_id,
        month: new Date(values.date).toLocaleString("default", { month: "long" }), // e.g., "April"
        icon: iconMap["DollarSign"] || null,
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter Income Title" className="bg-teal-50" />
              </FormControl>
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input {...field} type="time" className="bg-orange-50" />
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


        {/* <FormField
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
        /> */}

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 mt-6"
          disabled={!form.formState.isValid || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
      </form>
    </Form>
  )
}
