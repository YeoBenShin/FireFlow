import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import jwt from 'jsonwebtoken';

function getTodayDate() {
  const now = new Date(); // create a new Date object with the current date and time
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
  // create a new Date object of today's date but since no time is specified, it defaults to midnight (00:00:00)

  // Format to 'YYYY-MM-DD HH:mm:ss'
  const yyyy = midnight.getFullYear();
  const mm = String(midnight.getMonth() + 1).padStart(2, '0'); // add 1 to month since getMonth() is indexed from 0, padding to ensure two digits
  const dd = String(midnight.getDate()).padStart(2, '0');
  const hh = '00';
  const min = '00';
  const ss = '00';

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`; 
}   

export const getDayExpense = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const todayDate = getTodayDate();
  console.log(getTodayDate());

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount.sum()')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('dateTime', todayDate);

    if (error) {
      throw error;
    }

    res.status(200).json(data[0].sum|| 0); // Return total expense or 0 if no data found
  } catch (error) {
    console.error('Error fetching daily expenses:', error);
    res.status(500).json({ error: 'Failed to fetch daily expenses' });
  }
}