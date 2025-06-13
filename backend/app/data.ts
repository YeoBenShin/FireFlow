import { supabase } from "./supabaseClient";

export async function getTransactions() {
  const { data, error } = await supabase.from('transaction').select('*');
  if (error) throw error;
  return data;
}

export async function getGoals() {
  const { data, error } = await supabase.from('goal').select('*');
  if (error) throw error;
  return data;
}