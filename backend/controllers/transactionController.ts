import { Request, Response } from 'express';

export const getTransactions = (_req: Request, res: Response) => {
  res.json([
    {
      id: "1",
      title: "Salary",
      category: "Income",
      amount: 4000,
      date: "2025-06-10",
      time: "14:30",
      type: "income",
    },
  ]);
};

export const createTransaction = (req: Request, res: Response) => {
  const newTransaction = req.body;
  // Normally you would save to DB here
  res.status(201).json({ message: "Transaction created", data: newTransaction });
};