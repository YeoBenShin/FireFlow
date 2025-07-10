import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"
import dotenv from "dotenv";
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '@/.env.local') });

serve(async () => {
  const supabase = createClient(
    Deno.env.get(process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    Deno.env.get(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY)! // use service role for write access
  )

  // Fetch recurring transactions
  const { data, error } = await supabase
    .from("recurring_transaction")
    .select("*")

  if (error) {
    return new Response("Failed to fetch", { status: 500 })
  }

  // Loop through each and insert today's transaction if needed
  for (const recurring of data) {
    // example logic (you'll need to expand this)
    const today = new Date().toISOString().slice(0, 10)
    if (recurring.next_run_date === today) {
      await supabase.from("transaction").insert({
        user_id: recurring.user_id,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        dateTime: today,
      })

      // update next_run_date (e.g., add 1 month)
    }
  }

  return new Response("Recurring transactions updated")
})