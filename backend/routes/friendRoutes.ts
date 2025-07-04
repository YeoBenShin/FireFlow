import express from 'express';
import { getAllFriends, getAllFriendsRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend } from '../controllers/friendController';

const router = express.Router();

router.get('/', getAllFriends);
router.get('/requests', getAllFriendsRequests);
router.post('/send', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/reject', rejectFriendRequest);
router.delete('/delete', deleteFriend);

export default router;