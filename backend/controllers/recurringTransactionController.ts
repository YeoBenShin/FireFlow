import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { RecurringTransaction } from '../models/recurringTransaction';

export const getAllRecurringTransactions = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('recurring_transaction').select('*');
    
    if (error) {
      throw error;
    }
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
};

export const createRecurringTransaction = async (req: Request, res: Response) => {
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
    const { id } = req.body;

    try {
        const { data, error } = await supabase.from('recurring_transaction').delete().eq('id', id).select('*');
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
    const { recTransId, ...updateFields }: RecurringTransaction = req.body;
    const { data, error } = await supabase.from('recurring_transaction').update(updateFields).eq('id', recTransId).select('*');
    
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


