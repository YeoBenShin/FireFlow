import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { GoalParticipant } from '../models/goalParticipant'; 
import jwt from 'jsonwebtoken';

export const getGoalParticipants = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('goal_participants')
      .select(`
        *
      `);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching goal participants:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
 
// Controller to create a new goal
export const createGoalParticipant = async (req: Request, res: Response) => {
  console.log("Received request body:", req.body);
  req.body.user_id = (req.user as jwt.JwtPayload).sub;
  const newGoalParticipant = req.body;
    try {
      const {data, error} = await supabase.from('goal_participants').insert(newGoalParticipant).select();
      if(error){
        throw error;
      }
      res.status(201).json({ message: "Goal created", data: newGoalParticipant });
    } catch (error: any) {
        console.error("Supabase insert error:", error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
  };

  export const updateGoalParticipant = async (req: Request, res: Response) => {
    try {
      const user_id = (req.user as jwt.JwtPayload).sub;
      const {goal_id, ...updateFields} = req.body;

      const { data, error } = await supabase.from('goal_participants').update(updateFields).eq('goal_id', goal_id).eq('user_id', user_id).select('*');
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
  export const deleteGoalParticipant = async (req: Request, res: Response) => {

    try {
      const user_id = (req.user as jwt.JwtPayload).sub;
      const { goal_id } = req.body;

      const {data, error} = await supabase.from('goal_participants').delete().eq('goal_id', goal_id).eq('user_id', user_id).select('*');
      if (error) {
          throw error;
      } else if(data.length == 0){
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete goal participant' });
    }
  };

