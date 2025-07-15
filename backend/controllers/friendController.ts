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
      .select('friend_id, relationship')
      .eq('status', 'accepted')
      .eq('user_id', userId);
    
    const {data: friend2, error: friend2Error} = await supabase
      .from('friend')
      .select('user_id, relationship')
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

    // Get user details for all friends
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('user_id, username, name')
      .in('user_id', allFriendIds);

    if (usersError) {
      throw usersError;
    }

    // Combine friend data with user details
    const result = users.map(user => {
      // Find the relationship from either friend1 or friend2
      const friend1Data = friend1?.find(f => f.friend_id === user.user_id);
      const friend2Data = friend2?.find(f => f.user_id === user.user_id);
      const relationship = friend1Data?.relationship || friend2Data?.relationship || 'friend';
      
      return {
        username: user.username,
        name: user.name,
        friend: [{
          status: 'accepted',
          relationship: relationship
        }]
      };
    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Supabase error:", error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

export const getAllFriendsRequests = async (req: Request, res: Response) => {
  const userId = (req.user as jwt.JwtPayload).sub;
  const toAccept = req.query.toAccept === 'true';
  
  try {
    if (toAccept) {
      // Fetch all friend requests sent to the user (current user is the receiver)
      const { data: friendRequests, error } = await supabase
        .from('friend')
        .select('relationship, user_id')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error("Error fetching received requests:", error);
        throw error;
      }

      if (!friendRequests || friendRequests.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Get user details for the senders
      const senderIds = friendRequests.map(req => req.user_id);
      const { data: senders, error: senderError } = await supabase
        .from('user')
        .select('user_id, username, name')
        .in('user_id', senderIds);

      if (senderError) {
        console.error("Error fetching sender details:", senderError);
        throw senderError;
      }

      // Combine the data
      const result = friendRequests.map(friendReq => {
        const sender = senders?.find(sender => sender.user_id === friendReq.user_id);
        return {
          relationship: friendReq.relationship,
          user: sender || null
        };
      }).filter(item => item.user !== null);

      res.status(200).json(result);

    } else {
      // Fetch all friend requests sent by the user (current user is the sender)
      const { data: friendRequests, error } = await supabase
        .from('friend')
        .select('relationship, friend_id')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error("Error fetching sent requests:", error);
        throw error;
      }

      if (!friendRequests || friendRequests.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Get user details for the receivers
      const receiverIds = friendRequests.map(req => req.friend_id);
      const { data: receivers, error: receiverError } = await supabase
        .from('user')
        .select('user_id, username, name')
        .in('user_id', receiverIds);

      if (receiverError) {
        console.error("Error fetching receiver details:", receiverError);
        throw receiverError;
      }

      // Combine the data
      const result = friendRequests.map(friendReq => {
        const receiver = receivers?.find(receiver => receiver.user_id === friendReq.friend_id);
        return {
          relationship: friendReq.relationship,
          user: receiver || null
        };
      }).filter(item => item.user !== null);

      res.status(200).json(result);
    }

  } catch (error) {
    console.error("Supabase error in getAllFriendsRequests:", error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

export const sendFriendRequest = async (req: Request, res: Response) => {
  const username = req.body.username;
  const currentUserId = (req.user as jwt.JwtPayload).sub;

  try {
    // Get the friend's user ID
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

    if (userError) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    // Insert the friend relationship
    const { data: insertedData, error: insertError } = await supabase
      .from('friend')
      .insert({
        user_id: currentUserId,
        friend_id: user?.user_id,
        relationship: req.body.relationship || 'friend',
        status: 'pending'
      })
      .select('*');

    if (insertError) {
      console.error("Error inserting friend request:", insertError);
      throw insertError;
    }

    res.status(201).json({ message: "Friend Request Sent", data: insertedData });
  } catch (error) {
    console.error("Supabase error in sendFriendRequest:", error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
    const { username } = req.body;
    const userId = (req.user as jwt.JwtPayload).sub;

    try {
      // Get the sender's user ID from username
      const { data: sender, error: senderError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

      if (senderError) {
          res.status(404).json({ error: 'User not found' });
          return;
      }
      const senderId = sender?.user_id;

      // Find and update the friend request where sender sent to current user
      const { data, error } = await supabase
        .from('friend')
        .update({ status: 'accepted' })
        .eq('user_id', senderId)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .select('*');
        
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

export const cancelFriendRequest = async (req: Request, res: Response) => {
    const userId = (req.user as jwt.JwtPayload).sub;
    const { username } = req.body;

    try {
      const { data: friend, error: friendError } = await supabase
      .from('user')
      .select('user_id')
      .eq('username', username)
      .single();

      if (friendError) {
          res.status(404).json({ error: 'User not found' });
          return;
      }
      const friendId = friend?.user_id;

      // Delete the friend request sent by current user
      const { data, error } = await supabase
        .from('friend')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .eq('status', 'pending')
        .select('*');
        
      if (error) {
          throw error;
      } else if (data.length === 0) {
          res.status(404).json({ error: 'Friend request not found' });
          return;
      }

      res.status(200).json({ message: "Friend request cancelled successfully" });
    } catch (error) {
        console.error("Supabase delete error:", error);
        res.status(500).json({ error: 'Failed to cancel friend request' });
    }
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

      // Delete both directions of the friendship/request
      const { data: data1, error: error1 } = await supabase
        .from('friend')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .select('*');
        
      const { data: data2, error: error2 } = await supabase
        .from('friend')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .select('*');

      if (error1 && error2) {
          throw error1 || error2;
      }
      
      if ((data1?.length || 0) === 0 && (data2?.length || 0) === 0) {
          res.status(404).json({ error: 'Friend relationship not found' });
          return;
      }

      res.status(200).json({ message: "Friend deleted successfully" });
    } catch (error) {
        console.error("Supabase delete error:", error);
        res.status(500).json({ error: 'Failed to delete friend' });
    }
}