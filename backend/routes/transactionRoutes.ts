import express from 'express';
import { 
    getAllTransactions, 
    createTransaction, 
    deleteTransaction, 
    updateTransaction,
    getFilterTransactions
} from '../controllers/transactionController';

const router = express.Router();

router.get('/', getAllTransactions);
router.post('/create', createTransaction);
router.post('/delete', deleteTransaction);
router.post('/update', updateTransaction);
router.post('/filter', getFilterTransactions);

export default router;