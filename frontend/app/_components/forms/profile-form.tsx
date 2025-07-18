"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip"
import * as z from "zod";

// Schema: monthlyResetDate is string but will be transformed to number before sending
const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  // Accept string or number, transform to number
  monthlyResetDate: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !isNaN(val), { message: "Reset date must be a number" }),
  monthlySavings: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), {
      message: "Monthly savings must be a number",
    })
    .refine((val) => val >= 0, {
      message: "Monthly savings must be at least 0",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      name: "",
      monthlyResetDate: 0,
      monthlySavings: 0,
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5100/api/users", {
          method: "GET",
          credentials: "include",
          // headers: {
          //   "Content-Type": "application/json",
          // },
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        form.reset({
          ...data,
          monthlySavings: Number(data.monthly_savings),
          monthlyResetDate: Number(data.monthly_reset_date), // for input compatibility
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: ProfileFormValues) {
    console.log(values);
    setIsSubmitting(true);
    try {
      // Send as numbers
      const response = await fetch("http://localhost:5100/api/users/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          monthly_savings: Number(values.monthlySavings),
          name: values.name,
        })
      });

      console.log(response);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Update error:", errorBody);
        throw new Error("Failed to update profile");
      }
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Try a different username");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser() {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch("http://localhost:5100/api/users/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete user");
      alert("Your account has been deleted.");
      window.location.href = "/login"; // or your homepage
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 h-full w-full space-y-4 py-4"
        style={{ minHeight: 0 }}
      >
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-teal-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-teal-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlySavings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-1">
                    Monthly Savings
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent
                          className="text-white px-3 py-2 text-xs"
                          side="top"
                          align="start"
                          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
                        >
                          <p>
                            This is the amount you want to save each month. It
                            will be used to calculate your daily budget.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    className="bg-teal-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
        <Button
          type="button"
          onClick={handleDeleteUser}
          className="w-full bg-red-500 hover:bg-red-600 mt-2"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </Button>
      </form>
    </Form>
  );
}
