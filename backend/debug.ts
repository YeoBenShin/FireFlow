import { supabase } from "./db/supabaseClient";

async function debugDatabase() {
  console.log("=== DEBUGGING DATABASE ===");
  
  // Check all users
  const { data: users, error: usersError } = await supabase
    .from('user')
    .select('*');
  
  console.log("All users:", users);
  console.log("Users error:", usersError);
  
  // Check all friend requests
  const { data: friendRequests, error: friendError } = await supabase
    .from('friend')
    .select('*');
  
  console.log("All friend requests:", friendRequests);
  console.log("Friend requests error:", friendError);
}

debugDatabase().catch(console.error);
