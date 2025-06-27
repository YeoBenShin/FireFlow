import express from 'express';
import {
    getDayExpense,
    getMonthExpense,
    getMonthIncome,
    getFilteredMonthExpense
} from '../controllers/dashbardController';

const router = express.Router();

router.get('/', getDayExpense);
router.get('/month-expense', getMonthExpense);
router.get('/month-income', getMonthIncome);
router.post('/filtered-month-expense', getFilteredMonthExpense);

export default router;