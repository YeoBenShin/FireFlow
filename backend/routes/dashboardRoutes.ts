import express from 'express';
import {
    getDayExpense
} from '../controllers/dashbardController';

const router = express.Router();

router.get('/', getDayExpense);

export default router;