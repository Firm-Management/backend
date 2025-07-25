import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import firmRoutes from "./routes/firmRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Route registration
app.use("/api/auth", authRoutes); // Register the authentication routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/firms", firmRoutes);

// MongoDB connection
// RUN THIS COMMAND TO CONNECT MONGO
// sudo mongod --dbpath=/Users/lalitkumar/data/db

const MONGO_URI = "mongodb://localhost:27017/firm";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start the server
const PORT = 5005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
