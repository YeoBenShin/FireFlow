import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

function calculateNextRunDate(date: string, frequency: string): Date {
    // calculating the next run date based on frequency
      const selectedDate = new Date(date);
      let nextRunDate = new Date();
      nextRunDate.setDate(selectedDate.getDate() + 1);
      const todayDay = new Date().getDay();

      if (frequency === "weekly") {
        const daysUntilNext = (selectedDate.getDay() + 7 - todayDay) % 7 || 7;
        nextRunDate = new Date(todayDay + daysUntilNext);

      } else if (frequency === "biweekly") {
        let daysUntilNext = (selectedDate.getDay() + 7 - todayDay) % 7 || 7;
        daysUntilNext += 7; // Add an additional week for biweekly
        nextRunDate.setDate(selectedDate.getDate() + daysUntilNext);

      } else if (frequency === "monthly") {
        if (selectedDate.getDate() >= selectedDate.getDate()) {
          nextRunDate.setMonth(selectedDate.getMonth() + 1);
        }
        nextRunDate.setDate(selectedDate.getDate());  

      }
      return nextRunDate
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
    const today = new Date().toISOString().slice(0, 10);

    if (recurring.next_recurring_date === today) {
      // console.log(`Inserting transaction for ${recurring.description} on ${today}`);
      await supabase.from("transaction").insert({
        user_id: recurring.user_id,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        description: recurring.description,
        dateTime: new Date().toISOString(),
      })

      // update next_run_date (e.g., add 1 month)
      const nextRunDate = calculateNextRunDate(recurring.next_recurring_date, recurring.frequency);
      // console.log(`Next run date for ${recurring.description} is ${nextRunDate}`);

      // remove if nextRunDate is older than endDate
      const endDate: Date = recurring.endDate ? new Date(recurring.endDate) : new Date();
      if (nextRunDate.getFullYear() > endDate.getFullYear() || 
        nextRunDate.getMonth() > endDate.getMonth() || 
        nextRunDate.getDate() > endDate.getDate()) {

          await supabase.from("recurring_transaction")
          .update({ isActive: false })
          .eq("rec_trans_id", recurring.rec_trans_id);
      }

      await supabase.from("recurring_transaction")
      .update({ next_recurring_date: nextRunDate})
      .eq("rec_trans_id", recurring.rec_trans_id);
    }
  }

  return new Response("Recurring transactions updated")
})