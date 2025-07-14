import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Goal } from '../models/goal'; 
import jwt from 'jsonwebtoken';

export const getAllGoals = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  try {

    
      const { data, error } = await supabase
      .from('goal')
      .select('*')
      .eq('user_id', user_id)
      .order('target_date', {ascending: true });
      
      if (error) {
        throw error;
      }
      res.status(200).json(data);
  
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  };
 
// Controller to create a new goal
export const createGoal = async (req: Request, res: Response) => {
  console.log("Received request body:", req.body);
  req.body.user_id = (req.user as jwt.JwtPayload).sub;
  const newGoal = req.body;
    try {
      const {data, error} = await supabase.from('goal').insert(newGoal).select();
      if(error){
        throw error;
      }
      res.status(201).json({ message: "Goal created", data: newGoal });
    } catch (error: any) {
        console.error("Supabase insert error:", error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
  };

  export const updateGoal = async (req: Request, res: Response) => {
    try {
      const {goal_id, ...updateFields}: Goal = req.body;
      const { data, error } = await supabase.from('goal').update(updateFields).eq('goal_id', goal_id).select('*');
      if (error) {
        throw error;
      } else if (data.length === 0) {
        res.status(404).json({ error: 'goal not found' });
      }
      return; 
    } catch (error) {
      res.status(500).json({ error: 'Failed to update goal' });
    }
  };

  // Controller to delete a goal by ID for the authenticated user
  export const deleteGoal = async (req: Request, res: Response) => {

    try {
      const { goal_id } = req.body;
      console.log("Recieve goal_id:", goal_id);
      const {data, error} = await supabase.from('goal').delete().eq('goal_id', goal_id).select('*');
      if (error) {
          throw error;
      }
      else if(data.length == 0){
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete goal'});
    }
  };

