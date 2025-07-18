import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { verifyJWT } from "../jwt";
import loginRoutes from "../routes/loginRoutes";
import userRoutes from "../routes/userRoutes";
import transactionRoutes from "../routes/transactionRoutes";
import dashboardRoutes from "../routes/dashboardRoutes";
import recurringTransactionRoutes from "../routes/recurringTransactionRoutes";
import friendRoutes from "../routes/friendRoutes";
import goalRoutes from "../routes/goalRoutes";
import goalParticipantRoutes from "../routes/goalParticipantRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

// middleware
app.use(
  cors({
    origin: "https://fire-flow-brown.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(cookieParser());
app.use(express.json());

// transaction routes
app.use("/login", loginRoutes);
app.use("/api", verifyJWT);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recurring-transactions", recurringTransactionRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/goals", goalRoutes); 
app.use("/api/goal-participants", goalParticipantRoutes);

app.get("/", (_req, res) => {
  res.send("API is running...");
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
module.exports = app;
