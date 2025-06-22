import express from 'express';
import { 
    getUser,
    updateUser,
    deleteUser } from '../controllers/userController';

const router = express.Router();
router.get('/', getUser);
router.post('/update', updateUser);
router.delete('/delete', deleteUser);

export default router;