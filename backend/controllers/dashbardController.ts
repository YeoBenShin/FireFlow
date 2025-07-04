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

function getNextDate() {
  const now = new Date();
  let midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
  midnight.setDate(midnight.getDate() + 1); // Move to the next day

  const yyyy = midnight.getFullYear();
  const mm = String(midnight.getMonth() + 1).padStart(2, '0'); 
  const dd = String(midnight.getDate()).padStart(2, '0');
  const hh = '00';
  const min = '00';
  const ss = '00';

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`; 
}

function getThisMonth() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const yyyy = firstDayOfMonth.getFullYear();
  const mm = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
  const dd = String(firstDayOfMonth.getDate()).padStart(2, '0');
  const hh = '00';
  const min = '00';
  const ss = '00';

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function getNextMonth() {
  const now = new Date();
  let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDayOfMonth.setMonth(firstDayOfMonth.getMonth() + 1); // Move to the next month
  
  const yyyy = firstDayOfMonth.getFullYear();
  const mm = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
  const dd = String(firstDayOfMonth.getDate()).padStart(2, '0');
  const hh = '00';
  const min = '00';
  const ss = '00';

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export const getDayExpense = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount.sum()')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('dateTime', getTodayDate())
      .lt('dateTime', getNextDate());

    if (error) {
      throw error;
    }

    res.status(200).json(data[0].sum|| 0); // Return total expense or 0 if no data found
  } catch (error) {
    console.error('Error fetching daily expenses:', error);
    res.status(500).json({ error: 'Failed to fetch daily expenses' });
  }
}

export const getMonthExpense = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount.sum()')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('dateTime', getThisMonth())
      .lt('dateTime', getNextMonth());

    if (error) {
      throw error;
    }

    res.status(200).json(data[0].sum || 0); // Return total expense or 0 if no data found
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ error: 'Failed to fetch monthly expenses' });
  }
}

export const getMonthIncome = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount.sum()')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('dateTime', getThisMonth())
      .lt('dateTime', getNextMonth());

    if (error) {
      throw error;
    }

    res.status(200).json(data[0].sum || 0); // Return total expense or 0 if no data found
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ error: 'Failed to fetch monthly expenses' });
  }
}

export const getFilteredMonthExpense = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const { category } = req.body;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount.sum()')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .eq('category', category)
      .gte('dateTime', getThisMonth())
      .lt('dateTime', getNextMonth());

    if (error) {
      throw error;
    }

    res.status(200).json(data[0].sum || 0); // Return total expense or 0 if no data found
  } catch (error) {
    console.error('Error fetching filtered monthly expenses:', error);
    res.status(500).json({ error: 'Failed to fetch filtered monthly expenses' });
  }
}