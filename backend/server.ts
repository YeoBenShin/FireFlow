import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import transactionRoutes from './routes/transactionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/create-transaction', transactionRoutes);

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});