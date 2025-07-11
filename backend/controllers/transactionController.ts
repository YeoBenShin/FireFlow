import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from "../db/supabaseClient";
import { Transaction, FilteredTransaction } from '../models/transaction';

export const getAllTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('*')
      .eq('user_id', userId)
      .order('dateTime', { ascending: false });
    
    if (error) {
      throw error;
    }
    // Map snake_case to camelCase
    res.status(200).json(
      data.map(tx => ({
        transId: tx.trans_id,
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        dateTime: tx.dateTime,
        category: tx.category,
        userId: tx.user_id,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  req.body.user_id = (req.user as jwt.JwtPayload).sub;
  const newTransaction: Transaction = req.body;
  // console.log("Received body:", newTransaction);

  // Validate the incoming transaction data
  // const requiredFields = ["id", "description", "type", "amount", "dateTime", "category"];
  // const missingFields = requiredFields.filter(field => !(field in newTransaction));
  // if (missingFields.length > 0) {
  //   res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  // }

  try {
    const {data, error} = await supabase.from('transaction').insert(newTransaction).select();
    if (error) {  
      throw error;
    }
    res.status(201).json({ message: "Transaction created", data: data[0] });
  } catch (error) {
    console.error("Supabase insert error:", error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const {transId} = req.body;
    console.log("Received transactionId:", transId);
    const { data, error } = await supabase.from('transaction').delete().eq('trans_id', transId).select('*');
    
    if (error) {
      throw error;
    } else if (data.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const {transId, ...updateFields}: Transaction = req.body;
    const { data, error } = await supabase.from('transaction').update(updateFields).eq('trans_id', transId).select('*');
    
    if (error) {
      throw error;
    } else if (data.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const getFilterTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  let { description, type, amount, amountDirection, dateTime, dateDirection, category, numOfTrx }: FilteredTransaction = req.body;

  try {
    // Default to 5 transactions if numOfTrx is not provided
    numOfTrx = numOfTrx || 5;
    // building up a query object in memory. Nothing happens until you await.
    let query = supabase.from('transaction').select('*').eq('user_id', userId);

    if (description) {
      query = query.ilike('description', `%${description}%`);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.in('category', category);
    }

    if (amountDirection === 'equal' && amount) {
      query = query.eq('amount', amount);
    } else if (amountDirection === 'greater' && amount) {
      query = query.gt('amount', amount);
    } else if (amountDirection === 'less' && amount) {
      query = query.lt('amount', amount);
    }

    if (dateDirection === 'on' && dateTime) {
      query = query.gte('dateTime', dateTime);
      query = query.lt('dateTime', dateTime + 'T23:59:59');
    } else if (dateDirection === 'before' && dateTime) {
      query = query.lt('dateTime', dateTime);
    } else if (dateDirection === 'after' && dateTime) {
      query = query.gt('dateTime', dateTime);
    }

    query = query.order('dateTime', { ascending: false }).limit(numOfTrx);

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    // Map snake_case to camelCase
    res.status(200).json(
      data.map(tx => ({
        transId: tx.trans_id,
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        dateTime: tx.dateTime,
        category: tx.category,
        userId: tx.user_id,
      }))
    );
  } catch (error) {
    console.error("Supabase fetch error:", error);
    res.status(500).json({ error: 'Failed to filter transactions' });
  }
}

export const getMonthlyTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const type = req.query.type as string; // 'expense' or 'income'
  const currentYear = new Date().getFullYear();

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('dateTime, amount')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('dateTime', `${currentYear}-01-01T00:00:00`);

    if (error) {
      throw error;
    }

    // Process rows into a monthly sum
    let monthlySums: Record<string, number> = {};

    data.forEach(row => {
      const month = new Date(row.dateTime).toLocaleString('en-GB', { month: 'short', year: 'numeric' }); // e.g., "Jan 2023"
      monthlySums[month] = (monthlySums[month] || 0) + row.amount;
    });

    // Sort months
    const entries = Object.entries(monthlySums);
    const sortedEntries = entries.sort(([a], [b]) => { // taking out the key (month) from the entries
      return new Date(a) > new Date(b) ? 1 : -1;
    });
    monthlySums = Object.fromEntries(sortedEntries);

    res.status(200).json(monthlySums);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly transactions' });
  }
}

export const getYearlyTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const type = req.query.type as string; // 'expense' or 'income'

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('dateTime, amount')
      .eq('user_id', userId)
      .eq('type', type);

    if (error) {
      throw error;
    }

    // Process rows into a yearly sum
    let yearlySum: Record<string, number> = {};

    data.forEach(row => {
      const year = new Date(row.dateTime).toLocaleString('en-GB', { year: 'numeric' }); // e.g., "2023"
      yearlySum[year] = (yearlySum[year] || 0) + row.amount;
    });

    // Sort years
    const entries = Object.entries(yearlySum);
    const sortedEntries = entries.sort(([a], [b]) => { // taking out the key (month) from the entries
      return new Date(a) > new Date(b) ? 1 : -1;
    });
    yearlySum = Object.fromEntries(sortedEntries);

    res.status(200).json(yearlySum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch yearly transactions' });
  }
}

export const getMonthTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const type = req.query.type as string; // 'expense' or 'income'
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('dateTime, amount')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('dateTime', `${currentYear}-${currentMonth}-01T00:00:00`);

    if (error) {
      throw error;
    }

    // Process rows into a yearly sum
    let monthSum: Record<string, number> = {};

    data.forEach(row => {
      const day = new Date(row.dateTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // e.g., "01 Jan 2023"
      monthSum[day] = (monthSum[day] || 0) + row.amount;
    });

    // Sort years
    const entries = Object.entries(monthSum);
    const sortedEntries = entries.sort(([a], [b]) => { // taking out the key (month) from the entries
      return new Date(a) > new Date(b) ? 1 : -1;
    });
    monthSum = Object.fromEntries(sortedEntries);

    res.status(200).json(monthSum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch month transactions' });
  }
}

export const getCurrentMonthCategoryExpenses = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // JS months are 0-based
  const start = `${year}-${month}-01T00:00:00`;
  // Get the first day of the next month
  const nextMonth = new Date(year, now.getMonth() + 1, 1);
  const end = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01T00:00:00`;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('category, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('dateTime', start)
      .lt('dateTime', end);

    if (error) {
      throw error;
    }

    // Group and sum by category (case-insensitive)
    const categorySums: Record<string, number> = {};
    data.forEach(row => {
      if (!row.category || row.category.trim() === "") return;
      const key = row.category.trim().toLowerCase();
      categorySums[key] = (categorySums[key] || 0) + row.amount;
    });

    // Return with original casing for the first occurrence
    const result: Record<string, number> = {};
    data.forEach(row => {
      if (!row.category || row.category.trim() === "") return;
      const key = row.category.trim().toLowerCase();
      if (!(row.category.trim() in result)) {
        result[row.category.trim()] = categorySums[key];
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category expenses for current month' });
  }
};

export const getTodaysExpenses = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const start = `${year}-${month}-${day}T00:00:00`;
  const end = `${year}-${month}-${day}T23:59:59`;

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('dateTime', start)
      .lte('dateTime', end);

    if (error) {
      throw error;
    }

    const total = data.reduce((sum, row) => sum + (row.amount || 0), 0);
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s expenses' });
  }
};