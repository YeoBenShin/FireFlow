import express from 'express';
import { 
    getMyUser,
    updateUser,
    deleteUser } from '../controllers/userController';

const router = express.Router();
router.get('/', getMyUser);
router.post('/update', updateUser);
router.delete('/delete', deleteUser);

export default router;