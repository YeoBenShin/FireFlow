import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import jwt from 'jsonwebtoken';
import { RecurringTransaction } from '../models/recurringTransaction';

export const getAllRecurringTransactions = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub
  try {
    const { data, error } = await supabase.from('recurring_transaction').select('*').eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
};

export const createRecurringTransaction = async (req: Request, res: Response) => {
  req.body.user_id = (req.user as jwt.JwtPayload).sub;
  const newRecurringTransaction: RecurringTransaction = req.body;

  try {
    const { data, error } = await supabase.from('recurring_transaction').insert(newRecurringTransaction);
    if (error) {  
      throw error;
    }
    res.status(201).json({ message: "Recurring transaction created", data: newRecurringTransaction });
  } catch (error) {
    console.error("Supabase insert error:", error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
};

export const deleteRecurringTransaction = async (req: Request, res: Response) => {
    const { recTransId } = req.body;

    try {
        const { data, error } = await supabase.from('recurring_transaction').delete().eq('rec_trans_id', recTransId).select('*');
        if (error) {
            throw error;
        } else if (data.length === 0) {
            res.status(404).json({ error: 'Recurring transaction not found' });
        }

        res.status(200).json({ message: "Recurring transaction deleted successfully" });
    } catch (error) {
        console.error("Supabase delete error:", error);
        res.status(500).json({ error: 'Failed to delete recurring transaction' });
    }
};

export const updateRecurringTransaction = async (req: Request, res: Response) => {
  try {
    const { recTransId, ...updateFields } = req.body;
    const { data, error } = await supabase.from('recurring_transaction').update(updateFields).eq('rec_trans_id', recTransId).select('*');
    
    if (error) {
      throw error;
    } else if (data.length === 0) {
        res.status(404).json({ error: 'Recurring transaction not found' });
    }

    res.status(200).json({ message: "Recurring transaction updated", data });
  } catch (error) {
    console.error("Supabase update error:", error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
};


