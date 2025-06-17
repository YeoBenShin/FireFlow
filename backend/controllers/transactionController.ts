import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Transaction } from '../models/transaction';

export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('transaction').select('*');
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const createTransaction = (req: Request, res: Response) => {
  const newTransaction = req.body;
  // Normally you would save to DB here
  res.status(201).json({ message: "Transaction created", data: newTransaction });
};