import express from 'express';
import {
  getAllRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  updateRecurringTransaction
} from '../controllers/recurringTransactionController';

const router = express.Router();

router.get('/', getAllRecurringTransactions);
router.post('/create', createRecurringTransaction);
router.post('/delete', deleteRecurringTransaction);
router.post('/update', updateRecurringTransaction);

export default router;