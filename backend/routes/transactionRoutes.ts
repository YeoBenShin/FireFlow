import express from 'express';
import { 
    getAllTransactions, 
    createTransaction, 
    deleteTransaction, 
    updateTransaction,
    getFilterTransactions,
    getMonthlyTransactions,
    getYearlyTransactions
} from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/create', createTransaction);
router.post('/delete', deleteTransaction);
router.post('/update', updateTransaction);
router.post('/filter', getFilterTransactions);
router.get('/monthly-transactions', getMonthlyTransactions);
router.get('/yearly-transactions', getYearlyTransactions);

export default router;