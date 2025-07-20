import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

function calculateNextRunDate(date: string, frequency: string): Date {
    const selectedDate = new Date(date);
    let nextRunDate = new Date(selectedDate);

    if (frequency === "weekly") {
        nextRunDate.setDate(selectedDate.getDate() + 7);
    } else if (frequency === "biweekly") {
        nextRunDate.setDate(selectedDate.getDate() + 14);
    } else if (frequency === "monthly") {
        // Add 1 month, keeping the same day if possible
        const month = selectedDate.getMonth();
        nextRunDate.setMonth(month + 1);
        // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
        if (nextRunDate.getDate() < selectedDate.getDate()) {
            // Set to last day of previous month if overflowed
            nextRunDate.setDate(0);
        }
    } else {
        // Default: daily
        nextRunDate.setDate(selectedDate.getDate() + 1);
    }
    return nextRunDate;
}

function getSingaporeISOString(): string {
  const now = new Date();
  // Convert to Singapore time (UTC+8)
  now.setHours(now.getHours() + 8);
  return now.toISOString().slice(0, 19) + "+08:00";
}

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Use service role key for writes
  );
  
  // Fetch recurring transactions
  const { data, error } = await supabase
    .from("recurring_transaction")
    .select("*")
    .eq("isActive", true)

  if (error) {
    return new Response("Failed to fetch", { status: 500 })
  }
  // console.log("Fetched recurring transactions:", data);

  // Loop through each and insert today's transaction if needed
  for (const recurring of data) {
    let nextDate = recurring.next_recurring_date;
    const today = new Date().toISOString().slice(0, 10);

    // Loop to catch up all missed cycles
    while (nextDate <= today) {
      await supabase.from("transaction").insert({
        user_id: recurring.user_id,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        description: recurring.description,
        dateTime: getSingaporeISOString(),
      });

      // Calculate the next run date
      const nextRunDate = calculateNextRunDate(nextDate, recurring.frequency);

      // Only deactivate if endDate exists and nextRunDate is after endDate
      if (recurring.endDate) {
        const endDate: Date = new Date(recurring.endDate);
        if (
          nextRunDate.getFullYear() > endDate.getFullYear() || 
          (nextRunDate.getFullYear() === endDate.getFullYear() && nextRunDate.getMonth() > endDate.getMonth()) || 
          (nextRunDate.getFullYear() === endDate.getFullYear() && nextRunDate.getMonth() === endDate.getMonth() && nextRunDate.getDate() > endDate.getDate())
        ) {
          await supabase.from("recurring_transaction")
            .update({ isActive: false })
            .eq("rec_trans_id", recurring.rec_trans_id);
          break; // Stop processing if deactivated
        }
      }

      await supabase.from("recurring_transaction")
        .update({ next_recurring_date: nextRunDate })
        .eq("rec_trans_id", recurring.rec_trans_id);

      nextDate = nextRunDate.toISOString().slice(0, 10);
    }
  }

  return new Response("Recurring transactions updated")
})