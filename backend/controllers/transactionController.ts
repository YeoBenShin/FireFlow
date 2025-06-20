import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Transaction, FilteredTransaction } from '../models/transaction';

// DECIDE HOW WE WANT TO SEND IN USER ID
// is it in the request body or as a query parameter?

export const getAllTransactions = async (req: Request, res: Response) => {
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
    const {trans_id}: Transaction = req.body;
    // console.log("Received transactionId:", incomingTransaction.id);
    const { data, error } = await supabase.from('transaction').delete().eq('id', trans_id).select('*');
    
    if (error) {
      throw error;
    } else if (data.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const {trans_id, ...updateFields}: Transaction = req.body;
    const { data, error } = await supabase.from('transaction').update(updateFields).eq('id', trans_id).select('*');
    
    if (error) {
      throw error;
    } else if (data.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const getFilterTransactions = async (req: Request, res: Response) => {
  const { user_id, description, type, amount, amountDirection, dateTime, dateDirection, category}: FilteredTransaction = req.body;

  try {
    let query = supabase.from('transaction').select('*').eq('user_id', user_id);

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

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Supabase fetch error:", error);
    // maybe can add more specific error handling based on the error type to differentiate between user errors and server errors
    res.status(500).json({ error: 'Failed to filter transactions' });
  }
}