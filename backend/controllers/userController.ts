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

// Get user's available savings (total savings minus allocated amounts)
export const getUserSavings = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;

  try {
    console.log("=== GET USER SAVINGS ===");
    console.log("User ID:", user_id);

    // Get user's basic info
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      throw userError;
    }

    // Calculate total allocated amount by this user across all goals
    const { data: allocations, error: allocationsError } = await supabase
      .from('goal_participants')
      .select('allocated_amount')
      .eq('user_id', user_id);

    if (allocationsError) {
      console.error("Error fetching allocations:", allocationsError);
      throw allocationsError;
    }

    const totalAllocated = allocations?.reduce((sum, allocation) => 
      sum + (allocation.allocated_amount || 0), 0) || 0;

    // For now, let's assume the user has a base savings amount
    // This could come from user profile, transactions, or other sources
    const baseSavings = user.monthlySavings * 12 || 10000; // Example: annual savings
    const availableSavings = Math.max(0, baseSavings - totalAllocated);

    console.log("Savings calculation:");
    console.log("- Base savings:", baseSavings);
    console.log("- Total allocated:", totalAllocated);
    console.log("- Available:", availableSavings);

    res.status(200).json({
      availableSavings,
      totalAllocated,
      baseSavings
    });

  } catch (error) {
    console.error("Error calculating user savings:", error);
    res.status(500).json({ error: "Failed to calculate savings" });
  }
};
