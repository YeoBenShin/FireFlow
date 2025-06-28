import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from "../db/supabaseClient";
import { Transaction, FilteredTransaction } from '../models/transaction';

export const getAllTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  try {
    const { data, error } = await supabase.from('transaction').select('*').eq('user_id', userId).order('dateTime', { ascending: false });
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);

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
    res.status(201).json({ message: "Transaction created", data: newTransaction });
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
  const { description, type, amount, amountDirection, dateTime, dateDirection, category}: FilteredTransaction = req.body;

  try {
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