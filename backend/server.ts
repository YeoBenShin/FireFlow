import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { verifyJWT } from './jwt';
import loginRoutes from './routes/loginRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import recurringTransactionRoutes from './routes/recurringTransactionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

// middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// transaction routes
app.use('/login', loginRoutes);
app.use('/api', verifyJWT);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recurring-transactions', recurringTransactionRoutes);

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});