import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

export const getMyUser = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  // console.log("Fetching user with ID:", userId);

  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Supabase fetch error:", error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getFilteredUsers = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    // Example filter: { name: 'John' }
    const { data, error } = await supabase
      .from('user')
      .select('username, name')
      .ilike('username', `%${username}%`)
      .neq('user_id', (req.user as jwt.JwtPayload).sub); // case-insensitive search

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Supabase filter error:", error);
    res.status(500).json({ error: 'Failed to fetch filtered users' });
  }
};

// this will also be used on the first creation of a user
// username is unique, so need to prompt the user to change it if it already exists
export const updateUser = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const newUser: User = req.body;

  try {
    const { data, error } = await supabase
      .from('user')
      .update(newUser)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Supabase update error:", error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;

  try {
    const { data, error } = await supabase
      .from('user')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (data === null) {
      res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Controller to get user's available savings for allocation
export const getAvailableSavings = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  
  try {
    // Get total income
    const { data: incomeData, error: incomeError } = await supabase
      .from('transaction')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income');
      
    if (incomeError) throw incomeError;
    
    // Get total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('transaction')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense');
      
    if (expenseError) throw expenseError;
    
    // Calculate totals
    const totalIncome = incomeData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
    const totalExpenses = expenseData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
    
    // Available savings is simply income minus expenses
    // (Goal allocations reduce the goal target amounts, not the user's available savings)
    const availableSavings = totalIncome - totalExpenses;
    
    res.status(200).json({
      totalIncome,
      totalExpenses,
      availableSavings: Math.max(0, availableSavings) // Ensure non-negative
    });
    
  } catch (error: any) {
    console.error("Error calculating available savings:", error);
    res.status(500).json({ error: 'Failed to calculate available savings' });
  }
};
