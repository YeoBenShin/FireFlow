import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import jwt from 'jsonwebtoken';
import { Friend } from '../models/friend';

/**
 * 
 * @param req 
 * @param res 
 * @returns username + name of all friends
 */
export const getAllFriends = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  try {
    const {data: friend1, error: friend1Error}= await supabase
      .from('friend')
      .select('friend_id')
      .eq('status', 'accepted')
      .eq('user_id', userId);
    
    const {data: friend2, error: friend2Error} = await supabase
      .from('friend')
      .select('user_id')
      .eq('status', 'accepted')
      .eq('friend_id', userId);

    if (friend1Error || friend2Error) {
      console.error("Supabase error:", friend1Error || friend2Error);
      res.status(500).json({ error: 'Failed to fetch friends' });
      return;
    }
    
    // Extract friend_ids from friend1
    const friend1Ids = friend1 ? friend1.map(row => row.friend_id) : [];
    // Extract user_ids from friend2
    const friend2Ids = friend2 ? friend2.map(row => row.user_id) : [];
    // Combine them
    const allFriendIds = [...friend1Ids, ...friend2Ids];

    if (allFriendIds.length === 0) {
      res.status(200).json([]); // No friends found
      return;
    }

    const { data, error } = await supabase
      .from('user')
      .select('username, name, friend(status, relationship)')
      .in('user_id', allFriendIds);

    if (error) {
      throw error;
    }
    res.status(200).json(data);

  } catch (error) {
    console.log("Supabase error:", error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

export const getAllFriendsRequests = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const toAccept = req.query.toAccept === 'true';
  try {

    if (toAccept) {
      // Fetch all friend requests sent to the user
      const { data, error } = await supabase
        .from('friend')
        .select('relationship, user(username, name)')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
      res.status(200).json(data);

    } else {
      // Fetch all friend requests sent by the user
      const { data, error } = await supabase
        .from('friend')
        .select('relationship, user(username, name)')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
      res.status(200).json(data);
    }

  } catch (error) {
    console.error("Supabase error:", error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

export const sendFriendRequest = async (req: Request, res: Response) => {
  const username = req.body.username;

  try {
    // Step 1: Get the friend's user ID
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

    // console.log("Searching for user:", username);
    // console.log("Decoded Token:", req.user);
    // console.log("User data:", user);

    if (userError) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const newFriend = {
      user_id: (req.user as jwt.JwtPayload).sub,
      friend_id: user?.user_id,
      relationship: req.body.relationship || 'friend'
    };

    // Step 2: Insert the friend relationship
    const { error: insertError } = await supabase
      .from('friend')
      .insert(newFriend);

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({ message: "Friend Request Sent", data: newFriend });
  } catch (error) {
    console.error("Supabase error:", error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
    const { username } = req.body;
    const userId = (req.user as jwt.JwtPayload).sub;

    try {
      const { data: friend, error: friendError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

      if (friendError) {
          res.status(404).json({ error: 'Friend not found' });
          return;
      }
      const friendId = friend?.user_id;

      const { data, error } = await supabase.from('friend').update({ status: 'accepted' }).eq('user_id', userId).eq('friend_id', friendId).select('*');
      if (error) {
          throw error;
      } else if (data.length === 0) {
          res.status(404).json({ error: 'Friend request not found' });
          return;
      }

      res.status(200).json({ message: "Friend request accepted", data });
    } catch (error) {
        console.error("Supabase update error:", error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
}

export const rejectFriendRequest = async (req: Request, res: Response) => {
    deleteFriend(req, res); // Reuse delete function to reject friend request
}

export const deleteFriend = async (req: Request, res: Response) => {
    const userId = (req.user as jwt.JwtPayload).sub;
    const { username } = req.body;

    try {
      const { data: friend, error: friendError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

      if (friendError) {
          res.status(404).json({ error: 'Friend not found' });
          return;
      }
      const friendId = friend?.user_id;

      const { data, error } = await supabase.from('friend').delete().eq('user_id', userId).eq('friend_id', friendId).select('*');
      if (error) {
          throw error;
      } else if (data.length === 0) {
          res.status(404).json({ error: 'Friend not found' });
          return;
      }

      res.status(200).json({ message: "Friend deleted successfully" });
    } catch (error) {
        console.error("Supabase delete error:", error);
        res.status(500).json({ error: 'Failed to delete friend' });
    }
}