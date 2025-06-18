import express from 'express';

import { getAllTransactions } from '../controllers/transactionController';
import { createTransaction } from '../controllers/transactionController';
import { deleteTransaction } from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/create', createTransaction);
router.post('/delete', deleteTransaction);

export default router;