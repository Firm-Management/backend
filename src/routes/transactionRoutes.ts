import express from "express";
import Transaction from "../models/Transaction";
import Firm from "../models/Firm";
import authenticate from "../middleware/authenticate";
import { getFinancialYearRange } from "../helpers";

const router = express.Router();

// Get top 5 latest transactions with firm details for the authenticated user
router.get("/latest", authenticate, async (req, res) => {
  try {
    const userId = req.body.userDetails.id; // Get userId from userDetails
    // Fetch the top 5 latest transactions for the authenticated user
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 }) // Sort by creation date (newest first)
      .limit(5); // Limit to the top 5 transactions
    if (transactions.length > 0) {
      // Map over transactions to fetch firm details for each transaction
      const transactionsWithFirmDetails = await Promise.all(
        transactions.map(async (transaction) => {
          const firm = await Firm.findOne({ id: transaction.firmId, userId }); // Filter firm by userId
          return {
            ...transaction.toObject(), // Convert Mongoose document to plain object
            firmDetails: firm || null, // Add firm details or null if not found
          };
        })
      );

      res.json({
        data: transactionsWithFirmDetails,
        message: "Top 5 latest transactions fetched successfully.",
      });
    } else {
      res.status(200).json({
        data: [],
        message: "No transactions found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching latest transactions or firm details.",
      error,
    });
  }
});

// Get all transactions for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.body.userDetails.id; // Get userId from userDetails
    // Fetch all transactions for the authenticated user
    const transactions = await Transaction.find({ userId });

    if (transactions.length > 0) {
      // Map over transactions and fetch firm details for each transaction
      const transactionsWithFirmDetails = await Promise.all(
        transactions.map(async (transaction) => {
          const firm = await Firm.findOne({ id: transaction.firmId, userId }); // Filter firm by userId
          if (firm) {
            return {
              ...transaction.toObject(), // Convert Mongoose document to plain object
              firmDetails: firm, // Add firm details to each transaction
            };
          } else {
            return {
              ...transaction.toObject(),
              firmDetails: null, // If firm not found, add null
            };
          }
        })
      );

      res.json({
        data: transactionsWithFirmDetails,
        message: "Transactions fetched successfully.",
      });
    } else {
      res.status(200).json({
        data: [],
        message: "No transactions found.",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions or firm details.", error });
  }
});

router.get("/:firmId", authenticate, async (req, res): Promise<any> => {
  const firmId = parseInt(req.params.firmId);
  const userId = req.body.userDetails.id;
  const financialYear = req.query.financialYear as string | undefined;

  try {
    const firm = await Firm.findOne({ id: firmId, userId });
    if (!firm) return res.status(404).json({ message: "Firm not found." });

    // Get start and end of selected financial year (or default to current)
    const { startOfFY, endOfFY } = getFinancialYearRange(financialYear);

    // Fetch transactions within selected FY
    const transactions = await Transaction.find({
      firmId,
      userId,
      date: { $gte: startOfFY, $lte: endOfFY },
    });

    // Fetch all transactions before the start of this FY (not current FY)
    const previousTransactions = await Transaction.find({
      firmId,
      userId,
      date: { $lt: startOfFY },
    });

    // Calculate opening balance from previous transactions
    const lastYearBalance = previousTransactions.reduce((balance, tx) => {
      if (tx.type === "sale" || tx.type === "withdrawal") {
        return balance + tx.amount;
      } else if (tx.type === "purchase" || tx.type === "deposit") {
        return balance - tx.amount;
      }
      return balance;
    }, 0);

    // Attach firm info to each transaction
    const transactionsWithFirmDetails = transactions.map((tx) => ({
      ...tx.toObject(),
      firmDetails: firm,
    }));

    return res.json({
      financialYear: financialYear || "current",
      lastYearBalance,
      data: transactionsWithFirmDetails,
      message: "Transactions fetched successfully.",
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching firm or transactions.", error });
  }
});

// Get transaction details with firm for the authenticated user
router.get("/details/:id", authenticate, async (req, res): Promise<any> => {
  const transactionId = parseInt(req.params.id); // Extract transaction ID from params
  try {
    const userId = req.body.userDetails.id; // Get userId from userDetails

    // Fetch the transaction by ID
    const transaction = await Transaction.findOne({
      id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Fetch the corresponding firm details
    const firm = await Firm.findOne({ id: transaction.firmId, userId });

    res.json({
      ...transaction.toObject(), // Convert Mongoose document to plain object
      firmDetails: firm || null, // Add firm details if found, otherwise null
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transaction or firm details.", error });
  }
});

// Add a new transaction for the authenticated user
router.post("/", authenticate, async (req, res) => {
  const userId = req.body.userDetails.id; // Get userId from userDetails
  const newTransaction = new Transaction({
    ...req.body,
    userId, // Attach userId to the transaction
    id: Date.now(), // Automatically generate the `id` field
  });

  try {
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: "Error adding Transaction", error });
  }
});

// Update a transaction for the authenticated user
router.put("/:id", authenticate, async (req, res) => {
  const userId = req.body.userDetails.id; // Get userId from userDetails
  const updatedTransaction = await Transaction.findOneAndUpdate(
    { id: req.params.id, userId },
    req.body,
    { new: true }
  );
  res.json(updatedTransaction);
});

// Delete a transaction for the authenticated user
router.delete("/:id", authenticate, async (req, res) => {
  const userId = req.body.userDetails.id; // Get userId from userDetails
  await Transaction.findOneAndDelete({ id: req.params.id, userId });
  res.status(204).send();
});

export default router;
