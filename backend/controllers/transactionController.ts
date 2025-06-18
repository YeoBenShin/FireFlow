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

export const createTransaction = async (req: Request, res: Response) => {
  const newTransaction: Transaction = req.body;
  // console.log("Received body:", newTransaction);

  // Validate the incoming transaction data
  // const requiredFields = ["id", "description", "type", "amount", "dateTime", "category"];
  // const missingFields = requiredFields.filter(field => !(field in newTransaction));
  // if (missingFields.length > 0) {
  //   res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  // }

  try {
    const {data, error} = await supabase.from('transaction').insert(newTransaction);
    if (error) {  
      throw error;
    }
    res.status(201).json({ message: "Transaction created", data: newTransaction });
  } catch (error) {
    console.error("Supabase insert error:", error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const incomingTransaction: Transaction = req.body;
    // console.log("Received transactionId:", incomingTransaction.id);
    const { data, error } = await supabase.from('transaction').delete().eq('id', incomingTransaction.id);
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const incomingTransaction: Transaction = req.body;
    const { data, error } = await supabase.from('transaction').update(incomingTransaction).select('*').eq('id', incomingTransaction.id);
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};