import express from 'express';
import { 
    getAllTransactions, 
    createTransaction, 
    deleteTransaction, 
    updateTransaction,
    getFilterTransactions,
    getMonthlyTransactions,
    getYearlyTransactions,
    getMonthTransactions,
    getCurrentMonthCategoryExpenses,
    getTodaysExpenses
} from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/create', createTransaction);
router.post('/delete', deleteTransaction);
router.post('/update', updateTransaction);
router.post('/filter', getFilterTransactions);
router.get('/month-transactions', getMonthTransactions);
router.get('/monthly-transactions', getMonthlyTransactions);
router.get('/yearly-transactions', getYearlyTransactions);
router.get('/category-expenses-monthly', getCurrentMonthCategoryExpenses);
router.get('/todays-expenses', getTodaysExpenses);

export default router;