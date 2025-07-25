import express from "express";
import Firm from "../models/Firm";
import Transaction from "../models/Transaction";
import authenticate from "../middleware/authenticate";

const router = express.Router();

// Get all firms for the authenticated user
router.get("/", authenticate, async (req, res): Promise<any> => {
  try {
    const userId = req.body.userDetails.id; // Use userId from userDetails

    // Fetch the firms for the user
    const firms = await Firm.find({ userId });

    // Fetch all transactions for the user
    const transactions = await Transaction.find({ userId });

    // Function to calculate the balance and totals based on transactions
    const calculateBalanceAndTotals = (firmId: number) => {
      // Filter transactions for the specific firmId
      const firmTransactions = transactions.filter(
        (tx) => Number(tx.firmId) === firmId // Ensure firmId is a number for comparison
      );

      let balance = 0;
      let totalSale = 0;
      let totalPurchase = 0;
      let totalWithdraw = 0;
      let totalDeposit = 0;

      // Calculate balance and totals for each transaction type
      firmTransactions.forEach((tx) => {
        if (tx.type === "sale" || tx.type === "withdrawal") {
          balance += tx.amount;
          if (tx.type === "sale") totalSale += tx.amount;
          if (tx.type === "withdrawal") totalWithdraw += tx.amount;
        } else if (tx.type === "purchase" || tx.type === "deposit") {
          balance -= tx.amount;
          if (tx.type === "purchase") totalPurchase += tx.amount;
          if (tx.type === "deposit") totalDeposit += tx.amount;
        }
      });

      return { balance, totalSale, totalPurchase, totalWithdraw, totalDeposit };
    };

    // Prepare the firms data with calculated values
    const updatedFirms = firms.map((firm) => {
      const { balance, totalSale, totalPurchase, totalWithdraw, totalDeposit } =
        calculateBalanceAndTotals(firm.id); // Calculate all values for the firm

      return {
        ...firm.toObject(), // Convert firm to plain object
        balance, // Add calculated balance
        balanceType: balance > 0 ? "collect" : "pay", // Set balanceType
        totalSale,
        totalPurchase,
        totalWithdraw,
        totalDeposit,
      };
    });

    res.json({
      data: updatedFirms,
      message: "Firms and balances with totals fetched successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching firms and calculating balance", error });
  }
});

// Get a single firm by ID for the authenticated user
router.get("/:id", authenticate, async (req, res): Promise<any> => {
  try {
    const userId = req.body.userDetails.id; // Use userId from userDetails
    const firm = await Firm.findOne({ id: req.params.id, userId });

    if (!firm) {
      return res.status(404).json({ message: "Firm not found" });
    }

    res.json({ data: firm, message: "Firm fetched successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error fetching firm", error });
  }
});

// Add a new firm for the authenticated user
router.post("/", authenticate, async (req, res): Promise<any> => {
  const userId = req.body.userDetails.id; // Use userId from userDetails
  const newFirm = new Firm({
    ...req.body,
    userId, // Attach userId from userDetails
    id: Date.now(),
  });

  try {
    await newFirm.save();
    res.status(201).json({ firm: newFirm, message: "Firm Added successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error adding firm", error });
  }
});

// Update a firm for the authenticated user
router.put("/:id", authenticate, async (req, res): Promise<any> => {
  try {
    const userId = req.body.userDetails.id; // Use userId from userDetails
    const updatedFirm = await Firm.findOneAndUpdate(
      { id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!updatedFirm) {
      return res.status(404).json({ message: "Firm not found" });
    }

    res.json({ updatedFirm, userDetails: req.body.userDetails });
  } catch (error) {
    res.status(400).json({ message: "Error updating firm", error });
  }
});

// Delete a firm for the authenticated user
router.delete("/:id", authenticate, async (req, res): Promise<any> => {
  const userId = req.body.userDetails.id; // Use userId from userDetails
  const firmId = req.params.id;

  try {
    // Delete all transactions associated with the firm and user
    await Transaction.deleteMany({ firmId, userId });

    // Now delete the firm
    const deletedFirm = await Firm.findOneAndDelete({
      id: firmId,
      userId,
    });

    if (!deletedFirm) {
      return res.status(404).json({ message: "Firm not found" });
    }

    res.status(204).send(); // Successfully deleted the firm and its transactions
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting firm and transactions", error });
  }
});

export default router;
