import express from 'express';
import { getAllTransactions } from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);

export default router;