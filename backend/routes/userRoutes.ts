import express from 'express';
import { 
    getMyUser,
    getFilteredUsers,
    updateUser,
    deleteUser,
    getAvailableSavings } from '../controllers/userController';

const router = express.Router();
router.get('/', getMyUser);
router.get('/savings', getAvailableSavings);
router.post('/filter', getFilteredUsers);
router.post('/update', updateUser);
router.delete('/delete', deleteUser);

export default router;