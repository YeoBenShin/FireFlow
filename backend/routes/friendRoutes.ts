import express from 'express';
import { getAllFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend } from '../controllers/friendController';

const router = express.Router();

router.get('/', getAllFriends);
router.post('/send', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/reject', rejectFriendRequest);
router.delete('/delete', deleteFriend);

export default router;