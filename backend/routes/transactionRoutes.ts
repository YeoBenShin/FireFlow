import express from 'express';
// import {
//   getTransactions,
//   createTransaction,
// } from '../controllers/transactionController';
import { getTransactions } from '../app/data';


const router = express.Router();

// router.get('/', getTransactions);
// router.post('/', createTransaction);

router.get('/', async (_req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;