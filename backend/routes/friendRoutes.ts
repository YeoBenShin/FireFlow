import express from 'express';
import { getAllFriends, getAllFriendsRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend, cancelFriendRequest } from '../controllers/friendController';

const router = express.Router();

// Add cache-busting headers for friend requests
router.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

router.get('/', getAllFriends);
router.get('/requests', getAllFriendsRequests);
router.post('/send', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/reject', rejectFriendRequest);
router.post('/cancel', cancelFriendRequest);
router.delete('/delete', deleteFriend);

export default router;