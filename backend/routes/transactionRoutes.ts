import express from 'express';

import { getAllTransactions } from '../controllers/transactionController';
import { createTransaction } from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/', createTransaction);

export default router;